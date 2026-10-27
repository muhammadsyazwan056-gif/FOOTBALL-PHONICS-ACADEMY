import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_PHONEMES, INITIAL_CVC_WORDS } from '../../data/phonicsData';
import { soundManager, CloudAudioMetadata } from '../../services/audioService';
import {
  Lock,
  Unlock,
  Volume2,
  Upload,
  Mic,
  Square,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  Play,
  Cloud,
  Check,
  FileCheck,
} from 'lucide-react';

interface TeacherAudioManagementProps {
  onBackToHome: () => void;
}

export const TeacherAudioManagement: React.FC<TeacherAudioManagementProps> = ({ onBackToHome }) => {
  // Passcode gate (Server-side authenticated with Bearer token)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registry state synced from server
  const [cloudRegistry, setCloudRegistry] = useState<Record<string, CloudAudioMetadata>>({});
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(false);

  // Tab filter: 'phonemes' | 'words'
  const [activeTab, setActiveTab] = useState<'phonemes' | 'words'>('phonemes');
  const [searchFilter, setSearchFilter] = useState('');

  // Recording state
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Check existing session token
  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('fpa_teacher_token');
      if (savedToken) {
        setAuthToken(savedToken);
        setIsAuthenticated(true);
        fetchRegistry();
      }
    } catch {}
  }, []);

  const fetchRegistry = async () => {
    setIsLoadingRegistry(true);
    try {
      const res = await fetch('/api/audio/registry');
      if (res.ok) {
        const data = await res.json();
        setCloudRegistry(data);
        await soundManager.syncWithCloudRegistry();
      }
    } catch (err) {
      showToast('Could not fetch cloud audio registry.', 'error');
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPasscodeError('');

    try {
      const res = await fetch('/api/teacher/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('fpa_teacher_token', data.token);
        } catch {}
        soundManager.playCorrect();
        showToast('Teacher authenticated successfully.', 'success');
        fetchRegistry();
      } else {
        setPasscodeError(data.error || 'Incorrect passcode. Default teacher passcode is 1234.');
        soundManager.playIncorrect();
      }
    } catch (err) {
      setPasscodeError('Server authentication failed. Please check network.');
      soundManager.playIncorrect();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    try {
      sessionStorage.removeItem('fpa_teacher_token');
    } catch {}
    soundManager.playClick();
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string, category: 'phonemes' | 'words') => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;

    if (!file.type.includes('audio') && !file.name.match(/\.(mp3|wav|ogg|webm|m4a)$/i)) {
      showToast('Please select a valid audio file (.mp3, .wav, .ogg, .webm).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Audio file exceeds 10MB maximum limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('id', id);
    formData.append('category', category);
    formData.append('isVerified', 'true');
    formData.append('filename', file.name);

    try {
      showToast(`Uploading ${file.name} to cloud storage...`, 'info');
      const res = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        soundManager.playCorrect();
        showToast(`Saved to cloud storage successfully: ${data.entry.path}`, 'success');
        fetchRegistry();
      } else {
        showToast(data.error || 'Upload failed.', 'error');
      }
    } catch (err: any) {
      showToast('Network error during upload.', 'error');
    }
  };

  const startMicRecording = async (id: string) => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const category = id.startsWith('p_') ? 'phonemes' : 'words';

          try {
            showToast('Saving microphone recording to cloud storage...', 'info');
            const res = await fetch('/api/audio/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                id,
                category,
                base64Data,
                isVerified: true,
                filename: `${id}.webm`,
              }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
              soundManager.playCorrect();
              showToast(`Microphone recording saved to cloud: ${data.entry.path}!`, 'success');
              fetchRegistry();
            } else {
              showToast(data.error || 'Failed to save recording.', 'error');
            }
          } catch {
            showToast('Failed to upload recording.', 'error');
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingId(id);
    } catch (err) {
      showToast('Could not access microphone. Please check browser microphone permissions.', 'error');
    }
  };

  const stopMicRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecordingId(null);
    }
  };

  const handleMarkMissing = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/audio/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        showToast(`Marked audio for ${id} as missing.`, 'info');
        fetchRegistry();
      }
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleSetVerification = async (id: string, status: 'verified_cloud' | 'unverified_cloud') => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/audio/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast(`Status updated to ${status === 'verified_cloud' ? 'Verified' : 'Unverified'}.`, 'success');
        fetchRegistry();
      }
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const previewAudio = async (id: string, text: string) => {
    const res = await soundManager.playPhonicsItem(id, text);
    if (!res.success && res.message) {
      showToast(res.message, 'info');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-md">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 border border-amber-300">
            <Lock size={32} />
          </div>
          <span className="text-xs font-black tracking-widest text-amber-600 uppercase">
            Teacher Access Only
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1 mb-2">
            Pronunciation Audio Panel
          </h1>
          <p className="text-xs text-slate-600 mb-6">
            This area is restricted to educators to upload, verify, and manage pronunciation recordings stored in the dedicated Cloud Storage system.
          </p>

          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-xs font-bold text-slate-700 text-left mb-1.5">
                Teacher Passcode (Default: 1234)
              </label>
              <input
                id="passcode"
                type="password"
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode (1234)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                autoFocus
              />
            </div>

            {passcodeError && (
              <p className="text-xs font-semibold text-rose-600 text-left">{passcodeError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying with Cloud...' : 'Verify & Enter'}
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Return to Academy
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredPhonemes = INITIAL_PHONEMES.filter(
    p => p.letter.includes(searchFilter.toLowerCase()) || p.phoneme.includes(searchFilter.toLowerCase())
  );
  const filteredWords = INITIAL_CVC_WORDS.filter(w => w.word.includes(searchFilter.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Toast banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm border ${
            toastType === 'success'
              ? 'bg-slate-900 text-emerald-300 border-emerald-500'
              : toastType === 'error'
              ? 'bg-slate-900 text-rose-300 border-rose-500'
              : 'bg-slate-900 text-amber-300 border-amber-400'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : toastType === 'error' ? (
            <AlertCircle size={16} className="text-rose-400" />
          ) : (
            <Info size={16} className="text-amber-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Educator Portal
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck size={12} /> Server Authenticated
            </span>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <Cloud size={12} /> Cloud Storage Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Teacher Audio Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage pronunciation audio recordings for all Year 1 phonemes and CVC words stored in the dedicated cloud audio system.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Lock Panel
          </button>
          <button
            onClick={onBackToHome}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
          >
            Return to Academy
          </button>
        </div>
      </div>

      {/* Cloud Persistence & Security Architecture Note */}
      <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl p-4 mb-6 text-xs flex items-start gap-3 shadow-sm">
        <Cloud size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-white font-bold text-xs flex items-center gap-2">
            <span>Dedicated Cloud Storage System & Public Security</span>
            <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded">
              storage/audio/
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Recordings uploaded or recorded through this panel are saved directly to the cloud filesystem with structured paths (<code className="text-amber-300">phonemes/s.mp3</code>, <code className="text-amber-300">words/cat.mp3</code>). Public players have read-only access to stream approved audio without logging in, while write access is strictly locked to authenticated teachers.
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('phonemes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'phonemes' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phonemes ({INITIAL_PHONEMES.length})
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'words' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CVC Words ({INITIAL_CVC_WORDS.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter by letter or word..."
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Audio Data Table */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Phonics Item</th>
                <th className="px-4 py-3.5">Phoneme / Target</th>
                <th className="px-4 py-3.5">Cloud Storage Path</th>
                <th className="px-4 py-3.5">Verification Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeTab === 'phonemes' ? (
                filteredPhonemes.map(item => {
                  const entry = cloudRegistry[item.id];
                  const status = entry ? entry.status : 'verified_cloud';
                  const isRecording = recordingId === item.id;
                  const cloudPath = entry?.path || `phonemes/${item.letter}.wav`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <span className="font-mono text-base mr-2">{item.letter.toUpperCase()}</span>
                        <span className="text-slate-500 font-normal">({item.exampleWord})</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-amber-700">
                        {item.phoneme}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {cloudPath}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Preview button */}
                          <button
                            onClick={() => previewAudio(item.id, item.phoneme)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                            title="Preview sound"
                          >
                            <Volume2 size={15} />
                          </button>

                          {/* Live Mic Recording */}
                          {isRecording ? (
                            <button
                              onClick={stopMicRecording}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 animate-pulse"
                            >
                              <Square size={12} /> Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => startMicRecording(item.id)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg"
                              title="Record with microphone"
                            >
                              <Mic size={15} />
                            </button>
                          )}

                          {/* File Upload */}
                          <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer inline-flex items-center" title="Upload audio file (.mp3/.wav)">
                            <Upload size={15} />
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, item.id, 'phonemes')}
                            />
                          </label>

                          {/* Verify Toggle */}
                          {status !== 'verified_cloud' ? (
                            <button
                              onClick={() => handleSetVerification(item.id, 'verified_cloud')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Mark as Verified"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetVerification(item.id, 'unverified_cloud')}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Mark as Unverified"
                            >
                              <FileCheck size={15} />
                            </button>
                          )}

                          {/* Mark Missing */}
                          {status !== 'missing' && (
                            <button
                              onClick={() => handleMarkMissing(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Mark as missing"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                filteredWords.map(word => {
                  const entry = cloudRegistry[word.id];
                  const status = entry ? entry.status : 'verified_cloud';
                  const isRecording = recordingId === word.id;
                  const cloudPath = entry?.path || `words/${word.word}.wav`;

                  return (
                    <tr key={word.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <span className="font-mono text-base">{word.word.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {word.phonemes.join(' + ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {cloudPath}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => previewAudio(word.id, word.word)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
                            title="Preview sound"
                          >
                            <Volume2 size={15} />
                          </button>

                          {isRecording ? (
                            <button
                              onClick={stopMicRecording}
                              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 animate-pulse"
                            >
                              <Square size={12} /> Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => startMicRecording(word.id)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg"
                              title="Record with microphone"
                            >
                              <Mic size={15} />
                            </button>
                          )}

                          <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer inline-flex items-center" title="Upload audio file (.mp3/.wav)">
                            <Upload size={15} />
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={e => handleFileUpload(e, word.id, 'words')}
                            />
                          </label>

                          {status !== 'verified_cloud' ? (
                            <button
                              onClick={() => handleSetVerification(word.id, 'verified_cloud')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Mark as Verified"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetVerification(word.id, 'unverified_cloud')}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Mark as Unverified"
                            >
                              <FileCheck size={15} />
                            </button>
                          )}

                          {status !== 'missing' && (
                            <button
                              onClick={() => handleMarkMissing(word.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Mark as missing"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: 'verified_cloud' | 'unverified_cloud' | 'missing' | 'verified_built_in' | 'uploaded' }> = ({ status }) => {
  if (status === 'verified_cloud' || status === 'verified_built_in') {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
        <ShieldCheck size={12} /> Cloud Verified
      </span>
    );
  }
  if (status === 'unverified_cloud' || status === 'uploaded') {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
        <AlertCircle size={12} /> Unverified Upload
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
      <AlertCircle size={12} /> Missing Audio
    </span>
  );
};
