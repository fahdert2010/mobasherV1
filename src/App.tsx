import { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  HelpCircle, 
  FileCode, 
  Database, 
  CheckCircle, 
  Play, 
  RefreshCw, 
  Copy, 
  Download, 
  Search, 
  AlertCircle, 
  Cpu, 
  HardDrive, 
  Network, 
  Shield, 
  ChevronRight, 
  Globe, 
  Check, 
  Trash2, 
  Plus, 
  ExternalLink,
  ChevronLeft,
  Tv,
  ListFilter
} from 'lucide-react';
import { reportsData } from './data/reportsData';

// Simulated database records for interactive schema viewer
const mockChannelRecords = [
  { id: 1, name: "beIN Sports 1 Premium", category: "Sports (رياضية)", streamUrl: "http://qnap-ip:3000/live/bein1/index.m3u8", isActive: true },
  { id: 2, name: "SSC Sports 1 HD", category: "Sports (رياضية)", streamUrl: "http://qnap-ip:3000/live/ssc1/index.m3u8", isActive: true },
  { id: 3, name: "MBC 1 HD", category: "General (عامة)", streamUrl: "http://qnap-ip:3000/live/mbc1/index.m3u8", isActive: true },
  { id: 4, name: "Al Jazeera Arabic", category: "News (إخبارية)", streamUrl: "http://qnap-ip:3000/live/jazeera/index.m3u8", isActive: true }
];

const mockSessionRecords = [
  { id: "sess_08f12", username: "premium_sub", clientIp: "192.168.1.45", device: "Apple TV (Smarters Pro)", channelName: "beIN Sports 1 Premium", activeSeconds: 4210 },
  { id: "sess_91b72", username: "family_home", clientIp: "192.168.1.102", device: "Samsung Smart TV", channelName: "MBC 1 HD", activeSeconds: 1530 },
  { id: "sess_31c54", username: "mobile_user", clientIp: "172.56.24.89", device: "iPhone (VLC Player)", channelName: "Al Jazeera Arabic", activeSeconds: 840 }
];

export default function App() {
  // Global States
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'wizard' | 'docs' | 'schema'>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ----------------------------------------------------
  // Doc Viewer States
  // ----------------------------------------------------
  const [selectedDocId, setSelectedDocId] = useState<string>('qnap_migration_ar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [activeDocSection, setActiveDocSection] = useState<string>('');

  // ----------------------------------------------------
  // Docker Compose Generator States
  // ----------------------------------------------------
  const [dbPort, setDbPort] = useState<string>('5432');
  const [dbPassword, setDbPassword] = useState<string>('secure_password_here');
  const [redisPort, setRedisPort] = useState<string>('6379');
  const [appPort, setAppPort] = useState<string>('3000');
  const [qnapPath, setQnapPath] = useState<string>('/share/Container/mubasher');
  const [trialOverride, setTrialOverride] = useState<boolean>(true);
  const [licenseKey, setLicenseKey] = useState<string>('MUBASHER_STREAM_ENTERPRISE_UNLIMITED');

  // ----------------------------------------------------
  // Simulator & Dashboard States
  // ----------------------------------------------------
  const [containerStates, setContainerStates] = useState({
    db: 'running', // running, stopped
    cache: 'running',
    app: 'running',
    ffmpeg: 'running'
  });
  const [cpuLoad, setCpuLoad] = useState<number>(14);
  const [ramLoad, setRamLoad] = useState<number>(38);
  const [activeViewers, setActiveViewers] = useState<number>(3);
  const [bandwidthMbps, setBandwidthMbps] = useState<number>(12.4);
  const [simulatedSessions, setSimulatedSessions] = useState(mockSessionRecords);
  
  // FFmpeg stream simulation
  const [activeTranscodingChannel, setActiveTranscodingChannel] = useState<string>('beIN Sports 1 Premium');
  const [transcodePreset, setTranscodePreset] = useState<string>('veryfast');
  const [targetBitrate, setTargetBitrate] = useState<string>('3000');
  const [ffmpegSpeed] = useState<string>('1.05');
  const [simulatedLogs, setSimulatedLogs] = useState<Array<{ service: string; text: string; time: string; type: 'info' | 'warn' | 'success' }>>([
    { service: 'PostgreSQL', text: 'Database initialized on port 5432. Schema matches v3.0.0 migrations.', time: '15:41:10', type: 'success' },
    { service: 'Redis', text: 'In-memory client session cache pool configured successfully.', time: '15:41:11', type: 'info' },
    { service: 'App Engine', text: 'MubasherStream core listener booted successfully on port 3000.', time: '15:41:12', type: 'success' },
    { service: 'App Engine', text: 'License module bypass triggered: [BYPASS_EXPIRE_CHECK=true]. Infinite license activated.', time: '15:41:12', type: 'success' },
    { service: 'FFmpeg', text: 'FFmpeg Linux Binary found at /usr/bin/ffmpeg. Subsystem ready.', time: '15:41:13', type: 'info' }
  ]);
  const [selectedLogFilter, setSelectedLogFilter] = useState<string>('All');

  // ----------------------------------------------------
  // Wizard States
  // ----------------------------------------------------
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardVolume, setWizardVolume] = useState<string>('/share/CACHEDEV1_DATA');
  const [sshSimulatedLogs, setSshSimulatedLogs] = useState<string[]>([]);
  const [sshExecuted, setSshExecuted] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [wizardComposeDone, setWizardComposeDone] = useState<boolean>(false);
  const [wizardContainersLaunched, setWizardContainersLaunched] = useState<boolean>(false);
  const [wizardLaunchLogs, setWizardLaunchLogs] = useState<string[]>([]);
  const [qnapIpInput, setQnapIpInput] = useState<string>('192.168.1.100');
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');

  // ----------------------------------------------------
  // Schema Viewer States
  // ----------------------------------------------------
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string>('Channel');
  const [querySimulatorQuery, setQuerySimulatorQuery] = useState<string>('SELECT * FROM "Channel" WHERE "isActive" = true;');
  const [queryOutput, setQueryOutput] = useState<string>(JSON.stringify(mockChannelRecords, null, 2));

  // Audio simulator (uses Web Audio API if user triggers stream preview sound)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Helper Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Translations Map
  const t = (arKey: string, enKey: string) => {
    return lang === 'ar' ? arKey : enKey;
  };

  // React effect to simulate flickering metrics in Container Station dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      // CPU fluctuations
      setCpuLoad(prev => {
        const offset = Math.floor(Math.random() * 5) - 2;
        const currentActive = Object.values(containerStates).filter(s => s === 'running').length;
        const base = currentActive * 4;
        const next = Math.max(3, Math.min(85, base + prev + offset));
        return next;
      });

      // RAM fluctuations
      setRamLoad(prev => {
        const offset = Math.floor(Math.random() * 3) - 1;
        const currentActive = Object.values(containerStates).filter(s => s === 'running').length;
        const base = currentActive * 8;
        return Math.max(10, Math.min(92, base + prev + offset));
      });

      // Bandwidth fluctuations
      setBandwidthMbps(() => {
        if (containerStates.ffmpeg === 'stopped' || containerStates.app === 'stopped') return 0;
        const viewerCount = simulatedSessions.length;
        const baseBandwidth = viewerCount * 4.2;
        const offset = (Math.random() * 1.5) - 0.7;
        return Math.max(0, parseFloat((baseBandwidth + offset).toFixed(1)));
      });

      // Add a dynamic simulation log from time to time
      if (Math.random() > 0.75) {
        const services = ['PostgreSQL', 'Redis', 'App Engine', 'FFmpeg'];
        const selectedSrv = services[Math.floor(Math.random() * services.length)];
        let text = '';
        const type = 'info';

        if (containerStates.app === 'stopped' && selectedSrv === 'App Engine') return;
        if (containerStates.db === 'stopped' && selectedSrv === 'PostgreSQL') return;
        if (containerStates.cache === 'stopped' && selectedSrv === 'Redis') return;
        if (containerStates.ffmpeg === 'stopped' && selectedSrv === 'FFmpeg') return;

        switch (selectedSrv) {
          case 'PostgreSQL': {
            const dbLogs = [
              'Active transaction pool status: 0 idle, 2 active',
              'Pruned expired subscriber session tokens (0 cleared)',
              'Query executed: SELECT * FROM "Channel" ORDER BY "id" ASC'
            ];
            text = dbLogs[Math.floor(Math.random() * dbLogs.length)];
            break;
          }
          case 'Redis': {
            const rdLogs = [
              'Cache Hit for channel playlist metadata key (MUBASHER_CH_ALL)',
              'Memory optimizer executed in 1.4ms',
              'Client connection count: 12 active connections'
            ];
            text = rdLogs[Math.floor(Math.random() * rdLogs.length)];
            break;
          }
          case 'App Engine': {
            if (simulatedSessions.length > 0) {
              const client = simulatedSessions[Math.floor(Math.random() * simulatedSessions.length)];
              const appLogs = [
                `Heartbeat received from client: ${client.username} (${client.clientIp})`,
                `Stream session verification successful for user [${client.username}]`,
                `Proxying stream segments for [${client.channelName}]`
              ];
              text = appLogs[Math.floor(Math.random() * appLogs.length)];
            } else {
              text = 'HTTP Listener awaiting connections';
            }
            break;
          }
          case 'FFmpeg': {
            if (containerStates.ffmpeg === 'running') {
              const fpLogs = [
                `Segment HLS transcode completed successfully (PID 381, frame rate: 59.94)`,
                `HLS pipeline speed factor: ${(1.01 + Math.random() * 0.08).toFixed(2)}x`,
                `Buffer status: nominal (no frames dropped, target 3000kbps)`
              ];
              text = fpLogs[Math.floor(Math.random() * fpLogs.length)];
            }
            break;
          }
        }

        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setSimulatedLogs(prev => [
          { service: selectedSrv, text, time: timeStr, type },
          ...prev.slice(0, 49) // Limit to 50 logs
        ]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [containerStates, simulatedSessions]);

  // Audio Tone Synthesis for interactive premium feel
  const playInteractiveTone = (freq = 880, duration = 0.1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Safe fallback if audio Context is blocked by browser Iframe permissions
    }
  };

  // Toggle Stream audio preview (synth ambient wave)
  const toggleAudioMonitor = () => {
    if (isAudioPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      setIsAudioPlaying(false);
    } else {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // Low baseline hum
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsAudioPlaying(true);
        playInteractiveTone(440, 0.2);
      } catch (e) {
        showToast("Audio simulation blocked by browser sandbox policy.");
      }
    }
  };

  // Terminate a subscriber session (simulation)
  const handleKickSession = (id: string, username: string) => {
    playInteractiveTone(220, 0.3);
    setSimulatedSessions(prev => prev.filter(s => s.id !== id));
    setActiveViewers(prev => Math.max(0, prev - 1));
    
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setSimulatedLogs(prev => [
      { service: 'App Engine', text: `SECURITY EVENT: Session ${id} [${username}] forcefully terminated by Administrator command.`, time: timeStr, type: 'warn' },
      ...prev
    ]);
    showToast(t(`تم قطع اتصال المستخدم ${username} بنجاح`, `User ${username} disconnected successfully`));
  };

  // Add a simulation session
  const handleAddSession = () => {
    const usernames = ['skysurfer', 'iptv_king', 'mohamed_99', 'gulf_viewer', 'streamer_pro'];
    const ips = ['192.168.1.189', '84.23.112.5', '172.16.54.32', '192.168.1.201', '5.102.32.14'];
    const devices = ['Firestick (Kodi)', 'MAG Box 322', 'Smart TV (Duplex IPTV)', 'PC (VLC Player)', 'Android Phone (Smarters)'];
    const channels = ['beIN Sports 1 Premium', 'SSC Sports 1 HD', 'MBC 1 HD', 'Al Jazeera Arabic'];

    const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
    const randomIp = ips[Math.floor(Math.random() * ips.length)];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const randomCh = channels[Math.floor(Math.random() * channels.length)];
    const randomId = "sess_" + Math.random().toString(16).slice(2, 7);

    const newSess = {
      id: randomId,
      username: randomUser,
      clientIp: randomIp,
      device: randomDevice,
      channelName: randomCh,
      activeSeconds: 5
    };

    setSimulatedSessions(prev => [newSess, ...prev]);
    setActiveViewers(prev => prev + 1);
    playInteractiveTone(660, 0.15);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setSimulatedLogs(prev => [
      { service: 'App Engine', text: `New subscriber connection handshook successfully from IP ${randomIp} for stream [${randomCh}]`, time: timeStr, type: 'success' },
      ...prev
    ]);
  };

  // Toggle single container status
  const toggleContainer = (srv: 'db' | 'cache' | 'app' | 'ffmpeg') => {
    const nextState = containerStates[srv] === 'running' ? 'stopped' : 'running';
    setContainerStates(prev => ({
      ...prev,
      [srv]: nextState
    }));

    playInteractiveTone(nextState === 'running' ? 523.25 : 261.63, 0.15);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const srvName = srv === 'db' ? 'PostgreSQL' : srv === 'cache' ? 'Redis' : srv === 'app' ? 'App Engine' : 'FFmpeg';

    setSimulatedLogs(prev => [
      { 
        service: srvName, 
        text: nextState === 'running' ? `Service container started successfully and connected to bridge network.` : `Service container stopped. File handles closed and network socket released.`, 
        time: timeStr, 
        type: nextState === 'running' ? 'success' : 'warn' 
      },
      ...prev
    ]);
  };

  // Generate docker-compose code dynamically
  const generateDockerComposeYaml = () => {
    return `version: '3.8'

networks:
  mubasher-net:
    driver: bridge

services:
  # ١. حاوية قاعدة البيانات (PostgreSQL)
  mubasher-stream-db:
    image: postgres:15-alpine
    container_name: mubasher-stream-db
    restart: always
    networks:
      - mubasher-net
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${dbPassword}
      POSTGRES_DB: mubasher_db
    volumes:
      - ${qnapPath}/db_data:/var/lib/postgresql/data
    ports:
      - "${dbPort}:5432"

  # ٢. حاوية كاش الكاشف الذكي لملفات القنوات (Redis)
  mubasher-stream-cache:
    image: redis:7-alpine
    container_name: mubasher-stream-cache
    restart: always
    networks:
      - mubasher-net
    volumes:
      - ${qnapPath}/redis_data:/data
    ports:
      - "${redisPort}:6379"

  # ٣. الحاوية البرمجية للتطبيق ومحرك معالجة البث (Node.js & FFmpeg)
  mubasher-stream-app:
    image: node:18-alpine
    container_name: mubasher-stream-app
    restart: always
    networks:
      - mubasher-net
    depends_on:
      - mubasher-stream-db
      - mubasher-stream-cache
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:${dbPassword}@mubasher-stream-db:5432/mubasher_db
      - REDIS_URL=redis://mubasher-stream-cache:6379
      - FFMPEG_PATH=/usr/bin/ffmpeg
      - TRIAL_MODE=${trialOverride ? 'false' : 'true'}
      - BYPASS_EXPIRE_CHECK=${trialOverride ? 'true' : 'false'}
      - LICENSE_KEY=${licenseKey}
    volumes:
      - ${qnapPath}/app:/app
      - ${qnapPath}/logs:/app/logs
    working_dir: /app
    ports:
      - "${appPort}:3000"
    command: >
      sh -c "apk add --no-cache ffmpeg &&
             npm install --omit=dev &&
             node server.js"`;
  };

  // Clipboard copy handler
  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text);
    playInteractiveTone(1000, 0.1);
    showToast(t(`تم نسخ ${subject} للحافظة!`, `${subject} copied to clipboard!`));
  };

  // Download Yaml Handler
  const downloadYamlFile = () => {
    const text = generateDockerComposeYaml();
    const blob = new Blob([text], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'docker-compose.yml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playInteractiveTone(1200, 0.15);
    showToast(t("تم تحميل ملف docker-compose.yml بنجاح!", "docker-compose.yml file downloaded successfully!"));
  };

  // ----------------------------------------------------
  // Interactive Wizard Actions
  // ----------------------------------------------------
  const handleExecuteSshSshSimulation = () => {
    setSshExecuted(true);
    setSshSimulatedLogs([
      `[SSH] Connecting to admin@qnap-nas-ip... Success.`,
      `[SSH] Running command: mkdir -p ${wizardVolume}/Container/mubasher/{app,db_data,redis_data,logs}`,
      `[SSH] Creating volume directory: ${wizardVolume}/Container/mubasher/app`,
      `[SSH] Creating volume directory: ${wizardVolume}/Container/mubasher/db_data`,
      `[SSH] Creating volume directory: ${wizardVolume}/Container/mubasher/redis_data`,
      `[SSH] Creating volume directory: ${wizardVolume}/Container/mubasher/logs`,
      `[SSH] File permissions verified. (drwxrwxrwx for Container)`,
      `[SSH] Success: All directories mapped on QNAP hardware.`
    ]);
    playInteractiveTone(523, 0.2);
  };

  const handleSimulatedFileUpload = (filename: string) => {
    if (!uploadedFiles.includes(filename)) {
      setUploadedFiles(prev => [...prev, filename]);
      playInteractiveTone(880, 0.1);
    }
  };

  const handleLaunchContainersSimulation = () => {
    setWizardContainersLaunched(true);
    setWizardLaunchLogs([
      `[CLI] Starting Docker Compose deployment flow...`,
      `[CLI] Pulling image postgres:15-alpine... Done.`,
      `[CLI] Pulling image redis:7-alpine... Done.`,
      `[CLI] Pulling image node:18-alpine... Done.`,
      `[CLI] Creating network mubasher-net (bridge)... Created.`,
      `[CLI] Creating container mubasher-stream-db... Created.`,
      `[CLI] Creating container mubasher-stream-cache... Created.`,
      `[CLI] Creating container mubasher-stream-app... Created.`,
      `[CLI] Starting mubasher-stream-db... Started. (Port ${dbPort})`,
      `[CLI] Starting mubasher-stream-cache... Started. (Port ${redisPort})`,
      `[CLI] Starting mubasher-stream-app...`,
      `[APP-DOCKER] apk add --no-cache ffmpeg: Downloading package...`,
      `[APP-DOCKER] FFmpeg v6.0 installed successfully in container.`,
      `[APP-DOCKER] npm install: Loading production dependencies...`,
      `[APP-DOCKER] Server started on port 3000. License bypass active.`,
      `[CLI] Starting mubasher-stream-app... Started. (Port ${appPort})`,
      `[CLI] Deployment finished. 4/4 containers healthy.`
    ]);
    playInteractiveTone(587.33, 0.25);
  };

  const handlePingQnapServer = () => {
    setPingStatus('pinging');
    playInteractiveTone(350, 0.1);
    setTimeout(() => {
      setPingStatus('success');
      playInteractiveTone(1046, 0.3);
    }, 1500);
  };

  // Filter logs based on service selection
  const filteredLogsList = simulatedLogs.filter(log => {
    if (selectedLogFilter === 'All') return true;
    return log.service === selectedLogFilter;
  });

  // Schema query executor simulator
  const handleExecuteMockQuery = () => {
    playInteractiveTone(784, 0.1);
    let output = '';
    const q = querySimulatorQuery.toLowerCase();
    
    if (q.includes('channel')) {
      if (q.includes('isactive') || q.includes('active')) {
        output = JSON.stringify(mockChannelRecords.filter(c => c.isActive), null, 2);
      } else {
        output = JSON.stringify(mockChannelRecords, null, 2);
      }
    } else if (q.includes('session')) {
      if (q.includes('active') || q.includes('username')) {
        output = JSON.stringify(simulatedSessions, null, 2);
      } else {
        output = JSON.stringify(simulatedSessions, null, 2);
      }
    } else {
      output = `{\n  "status": "success",\n  "rows_affected": 0,\n  "message": "Query executed successfully, but returned an empty set."\n}`;
    }
    setQueryOutput(output);
  };

  const handleTableSelectInSchema = (tableName: string) => {
    setSelectedSchemaTable(tableName);
    playInteractiveTone(440, 0.08);
    if (tableName === 'Channel') {
      setQuerySimulatorQuery('SELECT * FROM "Channel" WHERE "isActive" = true;');
      setQueryOutput(JSON.stringify(mockChannelRecords, null, 2));
    } else if (tableName === 'Session') {
      setQuerySimulatorQuery('SELECT * FROM "Session" ORDER BY "activeTime" DESC;');
      setQueryOutput(JSON.stringify(simulatedSessions, null, 2));
    } else if (tableName === 'User') {
      setQuerySimulatorQuery('SELECT "id", "username", "role" FROM "User";');
      setQueryOutput(JSON.stringify([
        { id: 1, username: "admin_mubasher", role: "ADMIN" },
        { id: 2, username: "support_agent", role: "OPERATOR" },
        { id: 3, username: "subscriber_1", role: "USER" }
      ], null, 2));
    }
  };

  // Search highlighter for Markdown
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={index} className="bg-amber-500/30 text-amber-300 font-semibold px-0.5 rounded">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-bounce duration-300">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Menu */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-950/40">
              <Tv className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  MubasherStream
                </h1>
                <span className="bg-slate-900 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-800">
                  QNAP HUB v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t("بوابة الهجرة وإعداد الحاويات والتوثيق الذكي", "Migration Suite & Containerized Control Center")}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => { setActiveTab('dashboard'); playInteractiveTone(400, 0.05); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cpu className="h-4 w-4" />
              {t("اللوحة والمحاكي", "Simulator Monitor")}
            </button>
            <button 
              onClick={() => { setActiveTab('generator'); playInteractiveTone(400, 0.05); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'generator' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="h-4 w-4" />
              {t("محرر Compose", "Compose Builder")}
            </button>
            <button 
              onClick={() => { setActiveTab('wizard'); playInteractiveTone(400, 0.05); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'wizard' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              {t("مرشد التنصيب", "Installation Wizard")}
            </button>
            <button 
              onClick={() => { setActiveTab('schema'); playInteractiveTone(400, 0.05); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'schema' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="h-4 w-4" />
              {t("قاعدة البيانات", "DB Schema")}
            </button>
            <button 
              onClick={() => { setActiveTab('docs'); playInteractiveTone(400, 0.05); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'docs' 
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700/50' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Terminal className="h-4 w-4" />
              {t("المستندات والدراسة", "System Docs")}
            </button>
          </nav>

          {/* Language Toggle */}
          <button 
            onClick={() => { setLang(l => l === 'ar' ? 'en' : 'ar'); playInteractiveTone(800, 0.1); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-xs bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <Globe className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold">{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
          </button>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* ==================================================== */}
        {/* TAB 1: DASHBOARD & STREAM SIMULATOR */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Top KPIs Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{t("الاستهلاك الإجمالي للمعالج", "Total CPU Load")}</p>
                  <p className="text-2xl font-mono font-bold mt-1 text-cyan-400">{cpuLoad}%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <Cpu className="h-5 w-5 text-cyan-400" />
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{t("استهلاك الرامات", "Memory Allocations")}</p>
                  <p className="text-2xl font-mono font-bold mt-1 text-indigo-400">{ramLoad}%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <HardDrive className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{t("المشاهدات المتصلة حياً", "Active Viewers (Live)")}</p>
                  <p className="text-2xl font-mono font-bold mt-1 text-emerald-400">{activeViewers}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <Network className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{t("البث الخارج الإجمالي", "Output Bandwidth")}</p>
                  <p className="text-2xl font-mono font-bold mt-1 text-amber-400">{bandwidthMbps} Mbps</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* QNAP Container Station Simulator Panel */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {t("محاكي حاويات كيوناب (Container Station Panel)", "QNAP Container Station Panel (Simulator)")}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t("يمكنك إيقاف أو تشغيل الحاويات الفردية لرؤية سلوك النظام وتوزيع الأحمال.", "Simulate toggling container power states to view overall cluster integrity.")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Container 1: DB */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">postgres:15-alpine</span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">mubasher-stream-db</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      containerStates.db === 'running' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {containerStates.db === 'running' ? t('نشط', 'Healthy') : t('متوقف', 'Stopped')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                    <span className="text-slate-400">Port: 5432</span>
                    <button 
                      onClick={() => toggleContainer('db')}
                      className={`px-3 py-1 rounded font-semibold text-[11px] transition-all ${
                        containerStates.db === 'running'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {containerStates.db === 'running' ? t('إيقاف', 'Stop') : t('تشغيل', 'Start')}
                    </button>
                  </div>
                </div>

                {/* Container 2: Cache */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">redis:7-alpine</span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">mubasher-stream-cache</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      containerStates.cache === 'running' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {containerStates.cache === 'running' ? t('نشط', 'Healthy') : t('متوقف', 'Stopped')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                    <span className="text-slate-400">Port: 6379</span>
                    <button 
                      onClick={() => toggleContainer('cache')}
                      className={`px-3 py-1 rounded font-semibold text-[11px] transition-all ${
                        containerStates.cache === 'running'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {containerStates.cache === 'running' ? t('إيقاف', 'Stop') : t('تشغيل', 'Start')}
                    </button>
                  </div>
                </div>

                {/* Container 3: App */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">node:18-alpine</span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">mubasher-stream-app</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      containerStates.app === 'running' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {containerStates.app === 'running' ? t('نشط', 'Healthy') : t('متوقف', 'Stopped')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                    <span className="text-slate-400">Port: 3000</span>
                    <button 
                      onClick={() => toggleContainer('app')}
                      className={`px-3 py-1 rounded font-semibold text-[11px] transition-all ${
                        containerStates.app === 'running'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {containerStates.app === 'running' ? t('إيقاف', 'Stop') : t('تشغيل', 'Start')}
                    </button>
                  </div>
                </div>

                {/* Container 4: FFmpeg */}
                <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono">ffmpeg package</span>
                      <h4 className="font-bold text-sm text-slate-200 mt-1">ffmpeg-processor</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      containerStates.ffmpeg === 'running' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {containerStates.ffmpeg === 'running' ? t('يعالج', 'Active') : t('متوقف', 'Stopped')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                    <span className="text-slate-400">Status: Pipe Output</span>
                    <button 
                      onClick={() => toggleContainer('ffmpeg')}
                      className={`px-3 py-1 rounded font-semibold text-[11px] transition-all ${
                        containerStates.ffmpeg === 'running'
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {containerStates.ffmpeg === 'running' ? t('إيقاف', 'Stop') : t('تشغيل', 'Start')}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Stream Transcoding Simulator & Media Player */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Stream Controls */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between gap-5">
                <div>
                  <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                    <ListFilter className="h-4 w-4 text-cyan-400" />
                    {t("التحكم بمحول البث (FFmpeg Transcode Hub)", "FFmpeg Transcode Hub")}
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t("القناة المستهدفة للبث", "Active Streaming Target")}</label>
                      <select 
                        value={activeTranscodingChannel} 
                        onChange={(e) => { setActiveTranscodingChannel(e.target.value); playInteractiveTone(480, 0.08); }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-cyan-500"
                      >
                        {mockChannelRecords.map(ch => (
                          <option key={ch.id} value={ch.name}>{ch.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t("جودة البث المستهدفة (Bitrate)", "Target Stream Quality")}</label>
                      <select 
                        value={targetBitrate} 
                        onChange={(e) => { setTargetBitrate(e.target.value); playInteractiveTone(480, 0.08); }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-cyan-500"
                      >
                        <option value="6000">1080p 60fps (6000 kbps)</option>
                        <option value="3000">720p 30fps (3000 kbps)</option>
                        <option value="1500">480p SD (1500 kbps)</option>
                        <option value="800">Mobile low (800 kbps)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t("سرعة معالجة الأنوية (FFmpeg Preset)", "CPU Processing Speed Preset")}</label>
                      <select 
                        value={transcodePreset} 
                        onChange={(e) => { setTranscodePreset(e.target.value); playInteractiveTone(480, 0.08); }}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-cyan-500"
                      >
                        <option value="ultrafast">ultrafast (low CPU, high file-size)</option>
                        <option value="veryfast">veryfast (recommended)</option>
                        <option value="medium">medium (high CPU, pristine quality)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2 mt-4 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t("سرعة معالجة FFmpeg الحالية:", "Current FFmpeg Speed:")}</span>
                    <span className="font-mono text-cyan-400 font-bold">{ffmpegSpeed}x</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t("الفريمات الساقطة:", "Dropped Frames:")}</span>
                    <span className="font-mono text-emerald-400 font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t("تجاوز الفحص والترخيص:", "Licence Check Bypass:")}</span>
                    <span className="font-mono text-emerald-400 font-bold">BYPASS ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Center Column: Interactive Simulated Video Player */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Tv className="h-4 w-4 text-cyan-400 animate-bounce" />
                      {t("معاينة تدفق البث المباشر (HLS Live Stream Preview)", "Live Stream Preview Simulator")}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{activeTranscodingChannel}</p>
                  </div>
                  
                  <button 
                    onClick={toggleAudioMonitor}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAudioPlaying 
                        ? 'bg-rose-500 text-white shadow-lg' 
                        : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-900'
                    }`}
                  >
                    <RefreshCw className={`h-3 w-3 ${isAudioPlaying ? 'animate-spin' : ''}`} />
                    {isAudioPlaying ? t("كتم الصوت المحاكي", "Mute Audio Monitor") : t("استماع الصوت المحاكي", "Listen Audio Monitor")}
                  </button>
                </div>

                {/* Simulated Screen Canvas */}
                <div className="bg-slate-950 aspect-video rounded-xl border border-slate-900 flex flex-col items-center justify-center relative overflow-hidden group">
                  
                  {containerStates.ffmpeg === 'stopped' || containerStates.app === 'stopped' ? (
                    <div className="text-center p-4">
                      <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-rose-400">{t("البث معطل", "Streaming Engine Offline")}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {t("تأكد من تشغيل حاويات mubasher-stream-app و ffmpeg-processor.", "Activate both the App and FFmpeg container services above.")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Video Scanline Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-cyan-900/10 pointer-events-none mix-blend-overlay z-10" />

                      {/* Moving abstract background that looks like dynamic streaming video */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500 via-indigo-950 to-slate-950 animate-pulse" />

                      {/* Mock Player Bar Overlay */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 flex items-center gap-2 border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        LIVE {targetBitrate}kbps HLS
                      </div>

                      {/* Dynamic SVG / Canvas Bars representing audio stream */}
                      <div className="flex items-end gap-1.5 h-20">
                        {[...Array(18)].map((_, i) => {
                          const heights = [24, 45, 12, 60, 32, 54, 18, 48, 70, 20, 64, 40, 15, 50, 30, 42, 25, 10];
                          const delay = i * 0.1;
                          const barHeight = isAudioPlaying ? `${heights[i % heights.length]}px` : '8px';
                          return (
                            <div 
                              key={i} 
                              style={{ 
                                animationDelay: `${delay}s`,
                                height: barHeight
                              }}
                              className={`w-1.5 rounded-full bg-gradient-to-t from-cyan-500 to-indigo-500 transition-all duration-300 ${
                                isAudioPlaying ? 'animate-pulse' : ''
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900 backdrop-blur-sm z-20">
                        <span className="font-bold text-white text-[11px] truncate">{activeTranscodingChannel}</span>
                        <span className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400">FPS: 60.00 | Segment: #2401</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Active Connections Panel & Logging Terminal split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Active Connections Panel */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Network className="h-4 w-4 text-cyan-400" />
                      {t("الجلسات النشطة للمشتركين (Active Connections)", "Live Subscriber Sessions")}
                    </h4>
                    <button 
                      onClick={handleAddSession}
                      className="px-2.5 py-1 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 rounded-lg text-[11px] font-semibold flex items-center gap-1 border border-cyan-500/20 transition-all"
                    >
                      <Plus className="h-3 w-3" />
                      {t("محاكاة اتصال مشترك", "Simulate Client Connect")}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    {t("تتبع من يتابع بثك حياً الآن. يمكنك إنهاء الجلسة فوراً لمنع سرقة الروابط.", "Track playback sessions in real-time. Execute an active kick-out command to secure streams.")}
                  </p>

                  <div className="overflow-x-auto max-h-[300px] custom-scrollbar overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-medium">
                          <th className="py-2.5 px-3 text-right">{t("المشترك", "Subscriber")}</th>
                          <th className="py-2.5 px-3 text-right">IP Address</th>
                          <th className="py-2.5 px-3 text-right">{t("الجهاز المشغل", "Device")}</th>
                          <th className="py-2.5 px-3 text-right">{t("القناة", "Channel")}</th>
                          <th className="py-2.5 px-3 text-center">{t("إجراء", "Action")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulatedSessions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                              {t("لا توجد جلسات نشطة حالياً", "No active subscriber sessions detected.")}
                            </td>
                          </tr>
                        ) : (
                          simulatedSessions.map(session => (
                            <tr key={session.id} className="border-b border-slate-900 hover:bg-slate-950/40 transition-colors">
                              <td className="py-3 px-3 text-right font-semibold text-white">{session.username}</td>
                              <td className="py-3 px-3 text-right text-slate-300 font-mono text-[11px]">{session.clientIp}</td>
                              <td className="py-3 px-3 text-right text-slate-400">{session.device}</td>
                              <td className="py-3 px-3 text-right text-cyan-400 font-semibold">{session.channelName}</td>
                              <td className="py-3 px-3 text-center">
                                <button 
                                  onClick={() => handleKickSession(session.id, session.username)}
                                  className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-all"
                                  title={t("قطع الاتصال", "Force Disconnect")}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Simulated Logs Terminal */}
              <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyan-400" />
                      {t("سجل الأحداث البرمجي (Subsystem Logs Terminal)", "Subsystem Logs Terminal")}
                    </h4>
                    
                    {/* Log filter select */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Filter:</span>
                      <select 
                        value={selectedLogFilter} 
                        onChange={(e) => { setSelectedLogFilter(e.target.value); playInteractiveTone(400, 0.05); }}
                        className="bg-slate-950 border border-slate-900 text-[11px] font-mono p-1 rounded text-slate-300 outline-none"
                      >
                        <option value="All">All Services</option>
                        <option value="App Engine">App Engine</option>
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="Redis">Redis</option>
                        <option value="FFmpeg">FFmpeg</option>
                      </select>
                    </div>
                  </div>

                  {/* Terminal Box */}
                  <div className="bg-slate-950 rounded-xl border border-slate-900 p-3.5 font-mono text-[11px] h-[280px] overflow-y-auto custom-scrollbar space-y-1.5 select-text leading-relaxed">
                    {filteredLogsList.length === 0 ? (
                      <p className="text-slate-600 italic">{t("لا توجد سجلات تطابق الفلتر الحالي", "No logs found matching this filter.")}</p>
                    ) : (
                      filteredLogsList.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 border-b border-slate-900/20 pb-1">
                          <span className="text-slate-500 shrink-0 select-none">[{log.time}]</span>
                          <span className={`font-bold shrink-0 select-none px-1.5 py-0.1 text-[9px] rounded ${
                            log.service === 'PostgreSQL' ? 'bg-cyan-950 text-cyan-400' :
                            log.service === 'Redis' ? 'bg-indigo-950 text-indigo-400' :
                            log.service === 'App Engine' ? 'bg-emerald-950 text-emerald-400' :
                            'bg-amber-950 text-amber-400'
                          }`}>
                            {log.service}
                          </span>
                          <span className={`text-slate-300 break-all text-right ${
                            log.text.includes('SECURITY') || log.text.includes('stopped') ? 'text-amber-300' : ''
                          }`}>
                            {log.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: DOCKER COMPOSE GENERATOR */}
        {/* ==================================================== */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileCode className="h-5 w-5 text-indigo-400" />
                {t("مولد تكوين Docker Compose لـ QNAP", "Docker Compose Generator for QNAP")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {t("قم بتعديل قيم المتغيرات أدناه لتقوم بربط منافذ السيرفر والمسارات بما يتناسب مع نظام كيوناب لديك. سيقوم المولد بتحديث تكوين docker-compose.yml فورياً.", "Modify variables to suit your QNAP volume mapping. The generator instantly rebuilds the deployable configuration.")}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Inputs Sidebar */}
                <div className="space-y-4 bg-slate-950/60 p-5 rounded-xl border border-slate-900">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-2 pb-2 border-b border-slate-900">
                    {t("خيارات التخصيص", "Customization Scope")}
                  </h4>
                  
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">{t("موقع حفظ مجلدات المطور في QNAP", "QNAP Folder Base Path")}</label>
                    <input 
                      type="text" 
                      value={qnapPath} 
                      onChange={(e) => setQnapPath(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {t("المسار الافتراضي في كيوناب هو: /share/Container/mubasher", "Default QNAP shared storage volume is typically under /share/Container")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t("منفذ التطبيق (App Port)", "App Node Port")}</label>
                      <input 
                        type="text" 
                        value={appPort} 
                        onChange={(e) => setAppPort(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">{t("منفذ PostgreSQL", "DB Postgres Port")}</label>
                      <input 
                        type="text" 
                        value={dbPort} 
                        onChange={(e) => setDbPort(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">{t("منفذ الكاش (Redis Port)", "Redis Cache Port")}</label>
                    <input 
                      type="text" 
                      value={redisPort} 
                      onChange={(e) => setRedisPort(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">{t("كلمة مرور قاعدة البيانات", "Postgres Admin Password")}</label>
                    <input 
                      type="text" 
                      value={dbPassword} 
                      onChange={(e) => setDbPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">{t("مفتاح الترخيص الدائم", "Enterprise License Key")}</label>
                    <input 
                      type="text" 
                      value={licenseKey} 
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-900">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={trialOverride} 
                        onChange={(e) => { setTrialOverride(e.target.checked); playInteractiveTone(440, 0.1); }}
                        className="rounded bg-slate-950 border-slate-900 text-indigo-500 focus:ring-0 outline-none"
                      />
                      <span className="text-xs text-slate-300 font-semibold">
                        {t("تجاوز الفحص والقيود التجريبية", "Bypass Trial Limit Check (Unlimited)")}
                      </span>
                    </label>
                    <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                      {trialOverride ? 'BYPASS_EXPIRE_CHECK=true | TRIAL_MODE=false' : 'Trial evaluation mode (7 days limit)'}
                    </p>
                  </div>
                </div>

                {/* Live Updated YAML Output */}
                <div className="lg:col-span-2 flex flex-col justify-between bg-slate-950 p-5 rounded-xl border border-slate-900">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                    <span className="text-xs font-mono text-indigo-400 font-bold">docker-compose.yml</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => copyToClipboard(generateDockerComposeYaml(), "docker-compose.yml")}
                        className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded border border-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {t("نسخ", "Copy")}
                      </button>
                      <button 
                        onClick={downloadYamlFile}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-all flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-indigo-950/40"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("تحميل ملف", "Download File")}
                      </button>
                    </div>
                  </div>

                  <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto overflow-y-auto max-h-[480px] custom-scrollbar p-3 bg-slate-950 text-right select-text leading-relaxed">
                    {generateDockerComposeYaml()}
                  </pre>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: INSTALLATION WIZARD */}
        {/* ==================================================== */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t("مرشد تثبيت الحاويات التفاعلي لـ QNAP NAS", "Interactive QNAP Deployment Assistant")}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t("اتبع هذه الخطوات التفاعلية الست لتشغيل التطبيق على سيرفر كيوناب بلمسة واحدة وبسهولة.", "Complete the steps below to configure your QNAP Container Station environments and deploy.")}
                  </p>
                </div>
              </div>

              {/* Wizard Nav Steps */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-8 border-b border-slate-900 pb-5">
                {[...Array(6)].map((_, i) => {
                  const stepNum = i + 1;
                  const stepNamesAr = ['تثبيت المحرك', 'إعداد المجلدات', 'نقل الكود', 'التكوين', 'تشغيل الحاويات', 'فحص الصحة'];
                  const stepNamesEn = ['Install Station', 'Create Folders', 'Upload Files', 'Compose config', 'Launch Stack', 'Health Check'];
                  return (
                    <button 
                      key={i}
                      onClick={() => { setWizardStep(stepNum); playInteractiveTone(400, 0.05); }}
                      className={`p-3 rounded-lg text-center transition-all border ${
                        wizardStep === stepNum 
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40' 
                          : wizardStep > stepNum
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40 hover:bg-slate-900/80'
                          : 'bg-slate-950/60 text-slate-500 border-slate-900 hover:text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Step {stepNum}</div>
                      <div className="text-xs font-semibold">{t(stepNamesAr[i], stepNamesEn[i])}</div>
                    </button>
                  );
                })}
              </div>

              {/* Steps Layout */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-900">
                
                {/* Step 1: Install Container Station */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ١: تثبيت محرك الحاويات (Container Station) على QNAP", "Step 1: Install Container Station on QNAP")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("لتتمكن من تشغيل حاويات دوكر، يجب تثبيت التطبيق الرسمي الخاص بكيوناب المسمى Container Station من متجر التطبيقات.", "QNAP NAS relies on the Container Station environment to host Docker virtual networks and container images.")}
                    </p>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 flex items-center gap-4 max-w-lg">
                      <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                        <Tv className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">Container Station (v3.x)</p>
                        <p className="text-xs text-slate-400 mt-1">{t("يدعم Compose ومحركات معالجة البث بشكل كامل.", "Fully compatible with multi-container docker compose structures and FFmpeg hardware passes.")}</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        onClick={() => { setWizardStep(2); playInteractiveTone(523, 0.1); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-md flex items-center gap-2"
                      >
                        {t("الخطوة التالية", "Next Step")} <ChevronLeft className="h-4 w-4 md:hidden" /><ChevronRight className="h-4 w-4 hidden md:block" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Create QNAP Folders */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ٢: إعداد بنية المجلدات على هارد ديسك QNAP", "Step 2: Initialize Volume Folders on QNAP Hardware")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("يجب تهيئة مجلدات لحفظ البيانات والبرامج بشكل دائم حتى لا تضيع عند إعادة تشغيل السيرفر. حدد المسار الفعلي لسيرفر كيوناب وقم بنسخ الأمر الدفعي.", "Persistent storage directories are required to hold channel databases, cache records, and application assets.")}
                    </p>

                    <div className="max-w-md space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t("اسم وحدة التخزين (Volume Path)", "QNAP Storage Volume")}</label>
                        <select 
                          value={wizardVolume} 
                          onChange={(e) => { setWizardVolume(e.target.value); playInteractiveTone(400, 0.05); }}
                          className="bg-slate-900 border border-slate-900 p-2 rounded-lg text-xs w-full text-slate-300 outline-none font-mono"
                        >
                          <option value="/share/CACHEDEV1_DATA">/share/CACHEDEV1_DATA (Default Primary)</option>
                          <option value="/share/CACHEDEV2_DATA">/share/CACHEDEV2_DATA (Secondary RAID)</option>
                          <option value="/share/Container">/share/Container (Direct Container Mount)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 max-w-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-cyan-400 font-bold">{t("أمر SSH لإنشاء المجلدات فورياً", "SSH Script to build layout")}</span>
                        <button 
                          onClick={() => copyToClipboard(`mkdir -p ${wizardVolume}/Container/mubasher/{app,db_data,redis_data,logs}`, "SSH Command")}
                          className="p-1 bg-slate-950 text-slate-300 text-[10px] rounded hover:text-white border border-slate-800 flex items-center gap-1 font-semibold"
                        >
                          <Copy className="h-3 w-3" /> {t("نسخ الأمر", "Copy Code")}
                        </button>
                      </div>
                      <pre className="text-slate-300 font-mono text-xs overflow-x-auto pb-2 text-right">
                        mkdir -p {wizardVolume}/Container/mubasher/{"{"}app,db_data,redis_data,logs{"}"}
                      </pre>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={handleExecuteSshSshSimulation}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                      >
                        <Terminal className="h-4 w-4" />
                        {t("محاكاة تنفيذ الأمر SSH في كيوناب", "Simulate SSH Execution on QNAP")}
                      </button>
                    </div>

                    {sshExecuted && (
                      <div className="bg-black/80 rounded-lg p-3 font-mono text-[10px] text-slate-300 space-y-1 max-w-xl border border-slate-900">
                        {sshSimulatedLogs.map((log, idx) => (
                          <p key={idx} className={log.includes('Success') ? 'text-emerald-400 font-semibold' : ''}>{log}</p>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-900/60 flex gap-2">
                      <button 
                        onClick={() => { setWizardStep(1); playInteractiveTone(400, 0.05); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        {t("السابق", "Back")}
                      </button>
                      <button 
                        onClick={() => { setWizardStep(3); playInteractiveTone(523, 0.1); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                      >
                        {t("التالي", "Next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Transfer Files */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ٣: محاكاة نقل كود المشروع إلى مجلد QNAP app", "Step 3: Transfer Application Source Code")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("قم بنقل ملفات كود التطبيق الأساسي إلى مجلد /app الذي قمت بإنشائه على السيرفر لتجهيز التطبيق للعمل.", "Ensure all core files like package.json, server.js, and directories like /src are mapped inside the app volume.")}
                    </p>

                    <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-900 max-w-xl space-y-4">
                      <p className="text-xs text-slate-300 font-semibold mb-2">{t("انقر لمحاكاة رفع الملفات الأساسية المبرمجة:", "Click to upload files into the simulated QNAP workspace:")}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['package.json', 'server.js', 'schema.prisma', 'App.tsx'].map(file => {
                          const isUploaded = uploadedFiles.includes(file);
                          return (
                            <button
                              key={file}
                              onClick={() => handleSimulatedFileUpload(file)}
                              className={`p-3 rounded-lg text-center transition-all border flex flex-col items-center gap-2 ${
                                isUploaded 
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900' 
                                  : 'bg-slate-950 hover:bg-slate-900 text-slate-400 border-slate-900'
                              }`}
                            >
                              <FileCode className="h-6 w-6" />
                              <span className="text-[11px] font-mono font-bold">{file}</span>
                              <span className="text-[10px]">
                                {isUploaded ? '✓ Loaded' : '+ Transfer'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="text-xs text-slate-500 font-mono mt-2">
                        {t("الملفات المرفوعة حالياً في مجلد /app:", "Files uploaded inside QNAP app folder:")} {uploadedFiles.length === 0 ? 'None' : uploadedFiles.join(', ')}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-900/60 flex gap-2">
                      <button 
                        onClick={() => { setWizardStep(2); playInteractiveTone(400, 0.05); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        {t("السابق", "Back")}
                      </button>
                      <button 
                        onClick={() => { setWizardStep(4); playInteractiveTone(523, 0.1); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                      >
                        {t("التالي", "Next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Configure Compose */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ٤: مطابقة إعدادات Docker Compose والتأكد منها", "Step 4: Verify Docker-Compose YAML configurations")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("تأكد من مطابقة جميع متغيرات البيئة التي حددتها في لسان المولد لمطابقة مسار الهارد ديسك.", "Verify that mapped variables reflect active compose configurations.")}
                    </p>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 max-w-lg space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>{t("مسار التخزين في كيوناب:", "Mapped QNAP storage path:")}</span>
                        <span className="font-mono text-cyan-400 font-bold">{qnapPath}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>{t("منفذ البث الويب:", "Mubasher Web Port:")}</span>
                        <span className="font-mono text-cyan-400 font-bold">{appPort}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>{t("تجاوز حماية الترخيص والـ 7 أيام:", "Enterprise License bypass:")}</span>
                        <span className="font-mono text-emerald-400 font-bold">{trialOverride ? t('نشط (بلا حدود)', 'ACTIVE (Unlimited)') : t('غير مفعل', 'DISABLED')}</span>
                      </div>
                    </div>

                    {wizardComposeDone && (
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs font-semibold max-w-lg">
                        ✓ {t("تم تأكيد وحفظ ملف Docker Compose بنجاح!", "Docker Compose file confirmed and saved!")}
                      </div>
                    )}

                    <div className="pt-2">
                      <button 
                        onClick={() => { setWizardComposeDone(true); playInteractiveTone(880, 0.1); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                      >
                        <Check className="h-4 w-4" />
                        {t("تأكيد كود التكوين وحفظه", "Confirm Compose File Config")}
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-900/60 flex gap-2">
                      <button 
                        onClick={() => { setWizardStep(3); playInteractiveTone(400, 0.05); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        {t("السابق", "Back")}
                      </button>
                      <button 
                        onClick={() => { setWizardStep(5); playInteractiveTone(523, 0.1); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                      >
                        {t("التالي", "Next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Launch Stack */}
                {wizardStep === 5 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ٥: تشغيل الأوعية (Launch containers cluster)", "Step 5: Launch Stack inside Container Station")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("سنقوم الآن بمحاكاة سحب صور دوكر، تجميع التبعيات، وتحميل برنامج FFmpeg للينكس داخل حاوية التطبيق.", "Deploying the compose configuration pulls official Alpine images, configures directories, and registers network connections.")}
                    </p>

                    <div className="pt-2">
                      <button 
                        onClick={handleLaunchContainersSimulation}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md"
                      >
                        <Play className="h-4 w-4" />
                        {t("تشغيل البناء الكامل (docker-compose up -d)", "Launch Stack Command")}
                      </button>
                    </div>

                    {wizardContainersLaunched && (
                      <div className="bg-black rounded-lg p-4 font-mono text-[10px] text-slate-300 space-y-1 max-w-xl border border-slate-900 h-[220px] overflow-y-auto custom-scrollbar leading-relaxed">
                        {wizardLaunchLogs.map((log, idx) => (
                          <p key={idx} className={log.includes('Started') || log.includes('Success') || log.includes('healthy') ? 'text-emerald-400 font-semibold' : ''}>{log}</p>
                        ))}
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-900/60 flex gap-2">
                      <button 
                        onClick={() => { setWizardStep(4); playInteractiveTone(400, 0.05); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        {t("السابق", "Back")}
                      </button>
                      <button 
                        onClick={() => { setWizardStep(6); playInteractiveTone(523, 0.1); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                      >
                        {t("التالي", "Next")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Health Check */}
                {wizardStep === 6 && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-white text-base">{t("الخطوة ٦: فحص الاتصال الخارجي والوصول للوحة التحكم", "Step 6: Network connection health check")}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t("اكتب عنوان الـ IP الفعلي لسيرفر الـ NAS الخاص بك لفحص واختبار الاتصال المباشر بمنفذ الويب 3000.", "Enter the LAN IP address of your QNAP NAS below to test connectivity to the newly deployed proxy port.")}
                    </p>

                    <div className="flex gap-2 max-w-md">
                      <input 
                        type="text" 
                        value={qnapIpInput} 
                        onChange={(e) => setQnapIpInput(e.target.value)}
                        placeholder="e.g. 192.168.1.100"
                        className="bg-slate-900 border border-slate-900 rounded-lg text-xs p-2 text-slate-200 outline-none focus:border-emerald-500 font-mono w-full"
                      />
                      <button 
                        onClick={handlePingQnapServer}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md shrink-0 flex items-center gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${pingStatus === 'pinging' ? 'animate-spin' : ''}`} />
                        {t("فحص الاتصال", "Ping Server")}
                      </button>
                    </div>

                    {pingStatus === 'pinging' && (
                      <p className="text-xs text-slate-400 font-mono">Pinging http://{qnapIpInput}:{appPort}/api/health ...</p>
                    )}

                    {pingStatus === 'success' && (
                      <div className="bg-emerald-950/20 border border-emerald-900 p-4 rounded-xl max-w-xl space-y-2">
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" />
                          {t("سيرفر كيوناب نشط وسليم!", "Connection verification successful!")}
                        </p>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {t("يرحب بك خادم MubasherStream الآن. يمكنك الوصول للوحة التحكم عبر الرابط التالي في المتصفح الخاص بك:", "Your container stack is responding healthy. Launch the portal using this address:")}
                        </p>
                        <a 
                          href={`http://${qnapIpInput}:${appPort}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 font-mono font-bold text-xs underline hover:text-cyan-300"
                        >
                          http://{qnapIpInput}:{appPort} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-900/60 flex gap-2">
                      <button 
                        onClick={() => { setWizardStep(5); playInteractiveTone(400, 0.05); }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold rounded-lg"
                      >
                        {t("السابق", "Back")}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('dashboard'); playInteractiveTone(1000, 0.15); }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg"
                      >
                        {t("اكتمل التنصيب! اذهب للوحة", "Installation Complete! Go to Dashboard")}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: DATABASE SCHEMA & QUERY SIMULATOR */}
        {/* ==================================================== */}
        {activeTab === 'schema' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                {t("منظم وجداول قاعدة البيانات (Database Schema Analyzer)", "IPTV Relational Schema Visualizer & Query Workbench")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                {t("تعتمد نواة MubasherStream على قاعدة بيانات PostgreSQL 15 لتخزين وإدارة القنوات وسجلات الاتصالات. يمكنك هنا مراجعة هيكلية الجداول ومحاكاة الاستعلامات.", "Inspect internal Postgres relational models. Run mock queries against simulated tables like Channels, Sessions, and Users.")}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Schema visual layout */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider mb-2 pb-2 border-b border-slate-900">
                    {t("المخطط العلائقي (Tables)", "Relational Schemas")}
                  </h4>

                  {/* Table Card 1: Channel */}
                  <button 
                    onClick={() => handleTableSelectInSchema('Channel')}
                    className={`w-full text-right p-4 rounded-xl border transition-all flex items-start justify-between ${
                      selectedSchemaTable === 'Channel' 
                        ? 'bg-cyan-950/20 border-cyan-500 text-white' 
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-850'
                    }`}
                  >
                    <div>
                      <h5 className="font-mono font-bold text-sm text-slate-200 flex items-center gap-1.5">
                        <Database className="h-4 w-4 text-cyan-400" />
                        Channel
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-1">{t("جدول القنوات والروابط الأصلية", "Stores channel configurations & upstream paths")}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-cyan-400">4 fields</span>
                  </button>

                  {/* Table Card 2: Session */}
                  <button 
                    onClick={() => handleTableSelectInSchema('Session')}
                    className={`w-full text-right p-4 rounded-xl border transition-all flex items-start justify-between ${
                      selectedSchemaTable === 'Session' 
                        ? 'bg-cyan-950/20 border-cyan-500 text-white' 
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-850'
                    }`}
                  >
                    <div>
                      <h5 className="font-mono font-bold text-sm text-slate-200 flex items-center gap-1.5">
                        <Database className="h-4 w-4 text-indigo-400" />
                        Session
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-1">{t("تتبع جلسات المشتركين حياً", "Manages live client streaming leases")}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-indigo-400">6 fields</span>
                  </button>

                  {/* Table Card 3: User */}
                  <button 
                    onClick={() => handleTableSelectInSchema('User')}
                    className={`w-full text-right p-4 rounded-xl border transition-all flex items-start justify-between ${
                      selectedSchemaTable === 'User' 
                        ? 'bg-cyan-950/20 border-cyan-500 text-white' 
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-850'
                    }`}
                  >
                    <div>
                      <h5 className="font-mono font-bold text-sm text-slate-200 flex items-center gap-1.5">
                        <Database className="h-4 w-4 text-emerald-400" />
                        User
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-1">{t("صلاحيات المسؤولين والعملاء", "Users and security roles mappings")}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">3 fields</span>
                  </button>

                </div>

                {/* DB Details & SQL Executor */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Fields list */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-900">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-900 mb-3 font-mono">
                      {selectedSchemaTable} Schema Fields
                    </h4>

                    {selectedSchemaTable === 'Channel' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-cyan-400 font-bold block">id</span>
                          <span className="text-slate-400 block mt-1">Int (Primary Key)</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-cyan-400 font-bold block">name</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-cyan-400 font-bold block">category</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-cyan-400 font-bold block">isActive</span>
                          <span className="text-slate-400 block mt-1">Boolean</span>
                        </div>
                      </div>
                    )}

                    {selectedSchemaTable === 'Session' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">id</span>
                          <span className="text-slate-400 block mt-1">String (UUID)</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">username</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">clientIp</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">device</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">channelName</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-indigo-400 font-bold block">activeSeconds</span>
                          <span className="text-slate-400 block mt-1">Int</span>
                        </div>
                      </div>
                    )}

                    {selectedSchemaTable === 'User' && (
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-emerald-400 font-bold block">id</span>
                          <span className="text-slate-400 block mt-1">Int</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-emerald-400 font-bold block">username</span>
                          <span className="text-slate-400 block mt-1">String</span>
                        </div>
                        <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                          <span className="font-mono text-emerald-400 font-bold block">role</span>
                          <span className="text-slate-400 block mt-1">Enum (ADMIN, USER)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SQL Query Console simulator */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-900 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Terminal className="h-4 w-4 text-cyan-400" />
                        {t("منصة تشغيل الاستعلامات (Mock SQL Query Workbench)", "Mock SQL Query Workbench")}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={querySimulatorQuery} 
                        onChange={(e) => setQuerySimulatorQuery(e.target.value)}
                        className="bg-slate-900 border border-slate-900 rounded-lg text-xs p-2.5 text-slate-200 outline-none focus:border-cyan-500 font-mono w-full"
                      />
                      <button 
                        onClick={handleExecuteMockQuery}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-1 shrink-0"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {t("تنفيذ", "Run SQL")}
                      </button>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono block mb-1.5">Query Results Output (JSON Format):</span>
                      <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto overflow-y-auto max-h-[220px] custom-scrollbar text-right leading-relaxed select-text">
                        {queryOutput}
                      </pre>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: TECHNICAL STUDY & DOCUMENTATION HUB */}
        {/* ==================================================== */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            
            {/* Control Bar */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => { setSearchQuery(e.target.value); playInteractiveTone(400, 0.05); }}
                  placeholder={t("ابحث في كامل المستندات الفنية...", "Search technical document contents...")}
                  className="bg-slate-950 border border-slate-900 text-xs p-2 rounded-lg text-slate-200 outline-none w-full md:w-80 focus:border-cyan-500"
                />
              </div>

              {/* Document selection */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{t("المستند الحالي:", "Target Document:")}</span>
                <select 
                  value={selectedDocId} 
                  onChange={(e) => { setSelectedDocId(e.target.value); playInteractiveTone(600, 0.1); }}
                  className="bg-slate-950 border border-slate-900 text-xs p-2 rounded-lg text-slate-200 outline-none focus:border-cyan-500"
                >
                  {reportsData.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.lang === 'ar' ? ' AR ' : ' EN '} | {doc.title.slice(0, 45)}...
                    </option>
                  ))}
                </select>

                {/* Font customizer */}
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-900">
                  <button 
                    onClick={() => setTextSize('sm')} 
                    className={`px-2 py-1 text-[10px] rounded font-bold ${textSize === 'sm' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setTextSize('base')} 
                    className={`px-2 py-1 text-xs rounded font-bold ${textSize === 'base' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    A
                  </button>
                  <button 
                    onClick={() => setTextSize('lg')} 
                    className={`px-2 py-1 text-xs rounded font-bold ${textSize === 'lg' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Main Doc Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* Left Column: Sidebar Navigation (ToC) */}
              <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider pb-2 border-b border-slate-900">
                  {t("محتويات المستند", "Table of Contents")}
                </h4>
                
                <div className="space-y-1">
                  {reportsData.find(d => d.id === selectedDocId)?.sections.map(sec => (
                    <button
                      key={sec.id}
                      onClick={() => { setActiveDocSection(sec.id); playInteractiveTone(400, 0.05); }}
                      className={`w-full text-right py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                        activeDocSection === sec.id 
                          ? 'bg-slate-900 text-cyan-400 shadow-sm border-r-2 border-cyan-400' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-950/60'
                      }`}
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                  <p><strong>{t("اللغة:", "Language:")}</strong> {reportsData.find(d => d.id === selectedDocId)?.lang === 'ar' ? 'العربية' : 'English'}</p>
                  <p><strong>{t("رتبة الملف:", "Status:")}</strong> Approved Draft</p>
                </div>
              </div>

              {/* Right Column: Markdown Reader Area */}
              <div className="lg:col-span-3 bg-slate-900/20 border border-slate-900 p-6 rounded-2xl">
                
                {reportsData.filter(d => d.id === selectedDocId).map(doc => (
                  <div key={doc.id} className="space-y-8 select-text">
                    
                    {/* Document Head */}
                    <div className="border-b border-slate-900 pb-5">
                      <span className="text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest block mb-2">Technical Dossier</span>
                      <h2 className="text-2xl font-black text-white">{highlightText(doc.title, searchQuery)}</h2>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{doc.description}</p>
                    </div>

                    {/* Document Body Sections */}
                    <div className="space-y-10">
                      {doc.sections.map(sec => {
                        const isFocused = activeDocSection === sec.id || !activeDocSection;
                        if (!isFocused && activeDocSection) return null;

                        return (
                          <div key={sec.id} className="space-y-4">
                            <h3 className="text-lg font-bold text-cyan-300 border-b border-slate-900 pb-2 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                              {highlightText(sec.title, searchQuery)}
                            </h3>

                            <div className={`text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap ${
                              textSize === 'sm' ? 'text-xs' : textSize === 'lg' ? 'text-base' : 'text-sm'
                            }`}>
                              {highlightText(sec.content, searchQuery)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer credits and system indicators */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 items-center justify-between text-slate-400">
          <div>
            <p>© 2026 Google AI Studio - MubasherStream Migration Suite.</p>
            <p className="text-[10px] text-slate-500 mt-1">{t("نظام ترحيل الخدمات المتكامل من ويندوز إلى حاويات QNAP.", "A premium workbench to manage full-stack Dockerized transformations.")}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t("الترخيص الدائم نشط", "Infinite Enterprise License Active")}
            </span>
            <span className="font-mono text-[10px] text-slate-500">UTC: 2026-06-28</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
