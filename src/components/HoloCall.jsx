import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneCall, PhoneOff, MessageSquare, MonitorUp, Loader2 } from 'lucide-react';

export default function HoloCall() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);

  const pc1Ref = useRef(null);
  const pc2Ref = useRef(null);
  const dcRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const addMessage = (sender, text) => setMessages((m) => [...m, { id: crypto.randomUUID(), sender, text, time: new Date().toLocaleTimeString() }]);

  const createPeers = () => {
    const conf = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    const pc1 = new RTCPeerConnection(conf);
    const pc2 = new RTCPeerConnection(conf);

    // Data channel for chat
    const dc = pc1.createDataChannel('chat');
    dc.onopen = () => addMessage('system', 'Secure channel established');
    dc.onmessage = (e) => addMessage('guest', e.data);
    pc2.ondatachannel = (e) => {
      const ch = e.channel;
      ch.onmessage = (ev) => addMessage('guest', ev.data);
      dcRef.current = ch;
    };

    // Media
    pc2.ontrack = (event) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Local ICE negotiation (loopback)
    pc1.onicecandidate = (e) => e.candidate && pc2.addIceCandidate(e.candidate);
    pc2.onicecandidate = (e) => e.candidate && pc1.addIceCandidate(e.candidate);

    pc1Ref.current = pc1;
    pc2Ref.current = pc2;
    dcRef.current = dc;
  };

  const startSession = async () => {
    if (running || connecting) return;
    setConnecting(true);
    try {
      createPeers();
      const pc1 = pc1Ref.current;
      const pc2 = pc2Ref.current;

      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Add local tracks to both peers so remote receives them
      stream.getTracks().forEach((t) => pc1.addTrack(t, stream));
      stream.getTracks().forEach((t) => pc2.addTrack(t, stream));

      const offer = await pc1.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc1.setLocalDescription(offer);
      await pc2.setRemoteDescription(offer);
      const answer = await pc2.createAnswer();
      await pc2.setLocalDescription(answer);
      await pc1.setRemoteDescription(answer);

      setRunning(true);
      addMessage('system', 'Session started');
    } catch (err) {
      console.error(err);
      addMessage('system', 'Error initializing media or connection');
      await endSession();
    } finally {
      setConnecting(false);
    }
  };

  const endSession = async () => {
    setRunning(false);

    try {
      dcRef.current && dcRef.current.close();
    } catch {}

    try {
      pc1Ref.current && pc1Ref.current.close();
      pc2Ref.current && pc2Ref.current.close();
    } catch {}

    pc1Ref.current = null;
    pc2Ref.current = null;
    dcRef.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    addMessage('system', 'Session ended');
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMuted((m) => !m);
  };

  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCameraOff((c) => !c);
  };

  const shareScreen = async () => {
    if (!running) return;
    try {
      if (!screenStreamRef.current) {
        const scr = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = scr;
        // Replace video track on pc1
        const pc1 = pc1Ref.current;
        const senders = pc1.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) await videoSender.replaceTrack(scr.getVideoTracks()[0]);

        // When screen sharing stops, revert to camera
        scr.getVideoTracks()[0].onended = async () => {
          if (localStreamRef.current) {
            const camTrack = localStreamRef.current.getVideoTracks()[0];
            if (camTrack && videoSender) await videoSender.replaceTrack(camTrack);
          }
          scr.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
        };
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !dcRef.current) return;
    dcRef.current.send(text);
    addMessage('you', text);
    setChatInput('');
  };

  useEffect(() => {
    return () => { endSession(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(600px_circle_at_var(--x,50%)_var(--y,50%),rgba(168,85,247,0.10),transparent_40%)]" />

          <div className="grid md:grid-cols-2 gap-1 bg-black/30">
            <div className="relative aspect-video bg-black">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-fuchsia-600/70">You</div>
            </div>
            <div className="relative aspect-video bg-black">
              <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
              <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-cyan-600/70">Guest</div>
            </div>
          </div>

          <div className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button onClick={running ? endSession : startSession} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${running ? 'bg-red-600 hover:bg-red-500' : 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:brightness-110' }`}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : running ? <PhoneOff className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                {connecting ? 'Connecting…' : running ? 'End Session' : 'Start Session'}
              </button>
              <button onClick={toggleMute} disabled={!running} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${running ? 'border-white/20 hover:bg-white/10' : 'border-white/10 opacity-50 cursor-not-allowed' }`}>
                {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button onClick={toggleCamera} disabled={!running} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${running ? 'border-white/20 hover:bg-white/10' : 'border-white/10 opacity-50 cursor-not-allowed' }`}>
                {cameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {cameraOff ? 'Camera On' : 'Camera Off'}
              </button>
              <button onClick={shareScreen} disabled={!running} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${running ? 'border-white/20 hover:bg-white/10' : 'border-white/10 opacity-50 cursor-not-allowed' }`}>
                <MonitorUp className="h-4 w-4" />
                Share Screen
              </button>
            </div>
            <div className="text-xs text-slate-400">
              Tip: This demo links two local peers in one tab to showcase chat, voice, and video.
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-md bg-gradient-to-br from-fuchsia-600 to-cyan-500">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">Quantum Chat</h3>
              <p className="text-xs text-slate-400">Talk with your guest in real-time</p>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-sm text-slate-400">No messages yet. Start a session and say hello.</div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.sender === 'you' ? 'ml-auto bg-fuchsia-600/30 border border-fuchsia-400/20' : m.sender === 'system' ? 'mx-auto text-slate-300' : 'bg-cyan-600/20 border border-cyan-400/20' }`}>
                <div className="text-[10px] uppercase tracking-wide text-slate-300/70 mb-0.5">
                  {m.sender}
                </div>
                <div className="text-slate-100">{m.text}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.time}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={running ? 'Type a message…' : 'Start session to chat'}
                disabled={!running}
                className="flex-1 rounded-full bg-black/40 border border-white/10 px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
              />
              <button onClick={sendMessage} disabled={!running} className={`px-4 py-2 rounded-full font-medium ${running ? 'bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:brightness-110' : 'bg-white/10 text-slate-400 cursor-not-allowed' }`}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
