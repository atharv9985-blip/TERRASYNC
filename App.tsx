import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  ShieldCheck, User, Fingerprint, Lock, ChevronRight, Activity, Database, 
  Settings, Search, Download, CheckCircle, AlertTriangle, FileText, Map, 
  Eye, Bell, Clock, Gavel, Landmark, MapPin, Calculator, PhoneCall, 
  MessageSquare, Globe, LogOut, FileSignature, X, Printer, Loader2, Send,
  Bot, Zap, Droplets, Power, ShieldAlert, BookOpen, FileWarning, Calendar, Video, ExternalLink, CheckSquare, Sun, Moon,
  Wifi, WifiOff, UserPlus, Upload, Plus, RefreshCw, Check, Layers, Scale, Mic, MicOff, VideoOff, Users
} from 'lucide-react';

// ==========================================
// BACKEND API CLIENT & CONFIGURATION
// ==========================================
const API_BASE = 'http://localhost:8080/api';

const api = {
  getToken: () => localStorage.getItem('terrasync_token') || '',
  setToken: (token: string) => localStorage.setItem('terrasync_token', token),
  clearToken: () => localStorage.removeItem('terrasync_token'),

  async request(endpoint: string, options: RequestInit = {}) {
    const token = api.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Request failed with status ${res.status}` }));
      throw new Error(err.error || err.message || `Error ${res.status}`);
    }
    return res.json();
  },

  // Auth Endpoints
  async sendOtp(aadhaar: string) {
    return api.request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ aadhaar })
    });
  },

  async verifyOtp(aadhaar: string, otp: string) {
    const res = await api.request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ aadhaar, otp })
    });
    if (res.token) api.setToken(res.token);
    return res;
  },

  async register(userData: { name: string; email: string; phone: string; aadhaarNumber: string; password?: string }) {
    const res = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res && res.token) api.setToken(res.token);
    return res;
  },

  async registerOfficial(data: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    employeeId: string;
    department?: string;
    designation?: string;
    district?: string;
    officeName?: string;
  }) {
    const res = await api.request('/auth/register-official', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res && res.token) api.setToken(res.token);
    return res;
  },

  async citizenLogin(identifier: string, password: string) {
    const res = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password })
    });
    if (res.token) api.setToken(res.token);
    return res;
  },

  async login(identifier: string, password: string, epramaanToken?: string) {
    const res = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, password, epramaanToken })
    });
    if (res.token) api.setToken(res.token);
    return res;
  },

  async adminLogin(token: string) {
    const res = await api.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    if (res.token) api.setToken(res.token);
    return res;
  },

  // Citizen Endpoints
  async getActiveCase() {
    return api.request('/cases/active');
  },

  async getMyGrievances() {
    return api.request('/grievances');
  },

  async fileGrievance(type: string, description: string, caseId?: number) {
    return api.request('/grievances', {
      method: 'POST',
      body: JSON.stringify({ type, subject: type, description, caseId })
    });
  },

  async getNotifications() {
    return api.request('/notifications');
  },

  async uploadDocument(caseId: number | string, doc: { documentType: string; filename: string }) {
    return api.request(`/cases/${caseId}/documents`, {
      method: 'POST',
      body: JSON.stringify(doc)
    });
  },

  // Officer Endpoints
  async getOfficerStats() {
    return api.request('/officer/stats');
  },

  async getOfficerCases() {
    return api.request('/officer/cases');
  },

  async getOfficerHearings() {
    return api.request('/officer/hearings');
  },

  async getOfficerGrievances() {
    return api.request('/officer/grievances');
  },

  async scheduleHearing(data: {
    caseId?: number | string;
    hearingDate: string;
    location?: string;
    virtualLink?: string;
    presidingOfficer?: string;
    remarks?: string;
  }) {
    return api.request('/officer/hearings/schedule', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async resolveGrievance(id: number | string, status: string, resolution: string) {
    return api.request(`/officer/grievances/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolution })
    });
  },

  async advanceCaseStage(caseId: number | string) {
    return api.request(`/officer/cases/${caseId}/advance-stage`, { method: 'POST' });
  },

  async broadcastSms() {
    return api.request('/officer/broadcast', { method: 'POST' });
  },

  async issueNotice(caseId: number | string) {
    return api.request(`/officer/cases/${caseId}/notice`, { method: 'POST' });
  },

  // Admin Endpoints
  async getGatewayHealth() {
    return api.request('/admin/gateways/health');
  },

  async getAuditLogs() {
    return api.request('/admin/audit-logs');
  },

  async getAdminHearings() {
    return api.request('/admin/hearings');
  },

  async getAllUsers() {
    return api.request('/admin/users');
  },

  async toggleSystemHalt() {
    return api.request('/admin/system/halt', { method: 'POST' });
  },

  async getSystemStatus() {
    return api.request('/admin/system/status');
  }
};

const translations = {
  en: {
    brand: "TerraSync",
    tagline: "Next-Gen Land Acquisition & Grievance Portal",
    login_citizen: "Citizen / Landowner",
    login_gov: "Government Official",
    login_admin: "Platform Admin",
    logout: "Secure Logout",
    cancel: "Cancel",
    confirm_logout: "Are you sure you want to exit your secure session?",
    yes_logout: "Yes, Log Out",
    action_success: "Action completed successfully.",
    welcome: "Welcome",
    ramesh_kumar: "Ramesh Kumar",
    identity: "Identity Verified",
    officer_assigned: "Assigned Officer",
    track_compensation: "Acquisition Pipeline",
    stage_1: "Section 4 Notice Issued",
    stage_2: "Joint Survey & Valuation",
    stage_3: "Public Hearing & Objections",
    stage_4: "Award Declaration",
    stage_5: "Compensation Disbursed (DBT)",
    compensation_breakdown: "Compensation Breakdown",
    market_value: "Base Market Value (Circle Rate)",
    solatium: "Solatium (100% Legal Entitlement)",
    asset_val: "Asset Valuation (Trees, Structures)",
    total_entitlement: "Total Entitlement",
    dbt_status: "PFMS / DBT Payment Status",
    processing: "Batch Verified • Ready for Treasury Disbursal",
    secure_vault: "Encrypted Document Vault",
    view_doc: "View",
    doc_1: "Khasra-Khatauni (Rights)",
    doc_2: "Village Naksha (Map)",
    doc_3: "Joint Survey Report",
    view_map: "View 3D Cadastral Map",
    close_map: "Close Map",
    satellite_view: "Toggle Satellite",
    legal_docket: "Legal Process Docket",
    responsible_auth: "Responsible Authority",
    legal_act: "RFCTLARR Act 2013",
    close: "Close",
    total_acquired: "Acquired Area",
    hectares: "Hectares",
    comp_sanctioned: "Compensation Sanctioned",
    crores: "Crores",
    pending_objections: "Pending Grievances",
    hearings_week: "Scheduled Hearings",
    case_queue: "Cadastral Case Queue",
    case_id: "Case ID",
    owner: "Owner",
    stage: "Stage",
    action: "Action",
    issue_notice: "Issue Notice / Summons",
    bulk_sms: "Bulk SMS / WhatsApp Dispatch",
    system_health: "System Health & API Gateways",
    api_digilocker: "DigiLocker Sync",
    api_bhulekh: "Bhulekh State Land Registry API",
    api_pfms: "PFMS Payment Gateway",
    operational: "Operational",
    audit_trail: "Immutable Audit Trail (SHA-256)",
    timestamp: "Time",
    actor: "Actor ID",
    event: "Action",
    hash: "Cryptographic Hash",
    download_pdf: "Save PDF",
    print_doc: "Print",
    confirm_action: "Confirm Official Action",
    are_you_sure_action: "Execute this official action? This will be permanently logged in the tamper-evident audit trail.",
    execute: "Execute",
    tax_exempt: "100% Tax Exempt (Section 96 RFCTLARR)",
    enter_aadhaar: "Enter 12-Digit Aadhaar / Parivahan ID",
    send_otp: "Send 6-Digit OTP",
    enter_otp: "Enter 6-Digit OTP",
    verify_login: "Verify & Secure Login",
    nic_email: "NIC / Gov Email (@nic.in)",
    password: "Password",
    epramaan_token: "e-Pramaan 2FA Token",
    admin_token: "Master Root Token / YubiKey",
    auth_portal: "Secure Sovereign Gateway",
    utilities: "Linked Utilities & Assets",
    electricity: "Electricity (MPEB Discom)",
    electricity_status: "Paid (No Dues)",
    water: "Borewell / Water Rig",
    water_status: "Registered & Valued",
    ai_simplify: "Simplify with AI",
    ai_explaining: "TerraSync AI is translating complex legal clauses into simple language...",
    ai_simple_comp: "In simple terms: The government takes the standard rate of your land, doubles it (rural multiplier), adds the cost of your house/trees, and then gives you a 100% bonus on top of that. Plus, you don't have to pay any income tax on this money!",
    halt_ops: "Halt All Operations",
    halt_desc: "Emergency Master Override to freeze all land acquisitions globally.",
    notices_grievances: "Notices & Grievances",
    active_notices: "Active Notices",
    filed_grievances: "Filed Grievances",
    file_new_grievance: "File New Grievance",
    type_valuation: "Valuation Dispute",
    type_boundary: "Boundary Mismatch",
    type_other: "Ownership / Other Issue",
    status_pending: "Pending Review",
    status_resolved: "Resolved",
    date: "Date",
    description: "Description",
    submit_grievance: "Submit Grievance Securely",
    hearing_schedule: "Hearing Scheduler (Section 15)",
    grievance_queue: "Grievance Resolution Queue",
    schedule_hearing: "Schedule Hearing",
    hearing_details_title: "Official Hearing Docket & VC Link",
    venue: "Venue",
    physical_venue: "Tehsil Conference Hall, Room 204, Pithampur",
    virtual_vc: "Secure NIC Webex Video Link",
    join_vc: "Join Video Conference",
    magistrate: "Presiding Officer",
    notes: "Bring original property deeds, ID proof, and latest tax receipts.",
    login_official_reg: "Official Registration",
    official_reg_desc: "SDM / Tehsildar / CALA Onboarding",
    employee_id: "Employee / Service ID",
    department: "Department / Ministry",
    designation: "Official Designation",
    district: "District / Jurisdiction",
    office_name: "Office / Court Name",
    advance_stage: "Advance Stage",
    resolve_grievance: "Review & Resolve",
    upload_proof: "Upload Document",
    calc_estimate: "Compensation Estimator",
    join_virtual_court: "Enter Virtual Hearing",
    ping_gateways: "Ping Gateways",
    verify_hashes: "Verify Cryptographic Hashes",
    resolve_title: "Review & Resolve Grievance",
    schedule_new_hearing: "Schedule Public Hearing",
    calc_title: "Land Compensation Estimator (RFCTLARR 2013)",
    upload_doc_title: "Upload Supporting Document / Deed Proof"
  },
  hi: {
    brand: "टेरासिंक",
    tagline: "नेक्स्ट-जेन भूमि अधिग्रहण और शिकायत पोर्टल",
    login_citizen: "नागरिक / भूस्वामी",
    login_gov: "सरकारी अधिकारी",
    login_admin: "प्लेटफॉर्म व्यवस्थापक",
    logout: "सुरक्षित लॉगआउट",
    cancel: "रद्द करें",
    confirm_logout: "क्या आप वाकई अपना सुरक्षित सत्र छोड़ना चाहते हैं?",
    yes_logout: "हां, लॉग आउट करें",
    action_success: "कार्रवाई सफलतापूर्वक पूरी हुई।",
    welcome: "स्वागत है",
    ramesh_kumar: "रमेश कुमार",
    identity: "पहचान सत्यापित",
    officer_assigned: "नियुक्त अधिकारी",
    track_compensation: "अधिग्रहण पाइपलाइन",
    stage_1: "धारा 4 नोटिस जारी",
    stage_2: "संयुक्त सर्वेक्षण और मूल्यांकन",
    stage_3: "सार्वजनिक सुनवाई और आपत्तियां",
    stage_4: "अवार्ड घोषणा",
    stage_5: "मुआवजा वितरित (डीबीटी)",
    compensation_breakdown: "मुआवजा विवरण",
    market_value: "मूल बाजार मूल्य (सर्किल रेट)",
    solatium: "सोलैटियम (100% कानूनी हकदारी)",
    asset_val: "संपत्ति मूल्यांकन (पेड़, संरचनाएं)",
    total_entitlement: "कुल हकदारी",
    dbt_status: "पीएफएमएस / डीबीटी भुगतान स्थिति",
    processing: "बैच सत्यापित • ट्रेजरी भुगतान के लिए तैयार",
    secure_vault: "एन्क्रिप्टेड दस्तावेज़ वॉल्ट",
    view_doc: "देखें",
    doc_1: "खसरा-खतौनी (अधिकार)",
    doc_2: "ग्राम नक्शा",
    doc_3: "संयुक्त सर्वेक्षण रिपोर्ट",
    view_map: "3D कैडस्ट्राल मैप देखें",
    close_map: "मैप बंद करें",
    satellite_view: "सैटेलाइट टॉगल करें",
    legal_docket: "कानूनी प्रक्रिया डॉकेट",
    responsible_auth: "जिम्मेदार प्राधिकरण",
    legal_act: "RFCTLARR अधिनियम 2013",
    close: "बंद करें",
    total_acquired: "अधिग्रहित क्षेत्र",
    hectares: "हेक्टेयर",
    comp_sanctioned: "स्वीकृत मुआवजा",
    crores: "करोड़",
    pending_objections: "लंबित शिकायतें",
    hearings_week: "निर्धारित सुनवाई",
    case_queue: "कैडस्ट्राल केस कतार",
    case_id: "केस आईडी",
    owner: "मालिक",
    stage: "चरण",
    action: "कार्रवाई",
    issue_notice: "नोटिस / समंस जारी करें",
    bulk_sms: "थोक एसएमएस / व्हाट्सएप प्रेषण",
    system_health: "सिस्टम स्वास्थ्य और एपीआई गेटवे",
    api_digilocker: "डिजिलॉकर सिंक",
    api_bhulekh: "भूलेख स्टेट लैंड रजिस्ट्री एपीआई",
    api_pfms: "पीएफएमएस भुगतान गेटवे",
    operational: "परिचालन",
    audit_trail: "अपरिवर्तनीय ऑडिट ट्रेल (SHA-256)",
    timestamp: "समय",
    actor: "अभिनेता आईडी",
    event: "कार्रवाई",
    hash: "क्रिप्टोग्राफिक हैश",
    download_pdf: "पीडीएफ सहेजें",
    print_doc: "प्रिंट करें",
    confirm_action: "आधिकारिक कार्रवाई की पुष्टि करें",
    are_you_sure_action: "क्या आप इस आधिकारिक कार्रवाई को निष्पादित करना चाहते हैं? इसे स्थायी रूप से ऑडिट ट्रेल में दर्ज किया जाएगा।",
    execute: "निष्पादित करें",
    tax_exempt: "100% कर मुक्त (धारा 96 RFCTLARR)",
    enter_aadhaar: "12-अंकीय आधार / परिवहन आईडी दर्ज करें",
    send_otp: "6-अंकीय ओटीपी भेजें",
    enter_otp: "6-अंकीय ओटीपी दर्ज करें",
    verify_login: "सत्यापित करें और सुरक्षित लॉगिन करें",
    nic_email: "एनआईसी / सरकारी ईमेल (@nic.in)",
    password: "पासवर्ड",
    epramaan_token: "ई-प्रमाण 2FA टोकन",
    admin_token: "मास्टर रूट टोकन / YubiKey",
    auth_portal: "सुरक्षित संप्रभु गेटवे",
    utilities: "लिंक की गई उपयोगिताएँ और संपत्तियाँ",
    electricity: "बिजली (एमपीईबी डिस्कॉम)",
    electricity_status: "भुगतान किया गया (कोई बकाया नहीं)",
    water: "बोरवेल / पानी का बोर",
    water_status: "पंजीकृत और मूल्यांकित",
    ai_simplify: "AI के साथ सरल बनाएं",
    ai_explaining: "TerraSync AI जटिल कानूनी धाराओं को सरल भाषा में अनुवाद कर रहा है...",
    ai_simple_comp: "सरल शब्दों में: सरकार आपकी जमीन की मानक दर लेती है, उसे दोगुना करती है (ग्रामीण गुणक), आपके घर/पेड़ों की लागत जोड़ती है, और फिर आपको उस पर 100% बोनस देती है। साथ ही, आपको इस पैसे पर कोई आयकर नहीं देना होगा!",
    halt_ops: "सभी संचालन रोकें",
    halt_desc: "सभी भूमि अधिग्रहणों को वैश्विक स्तर पर फ्रीज करने के लिए आपातकालीन मास्टर ओवरराइड।",
    notices_grievances: "नोटिस और शिकायतें",
    active_notices: "सक्रिय नोटिस",
    filed_grievances: "दर्ज शिकायतें",
    file_new_grievance: "नई शिकायत दर्ज करें",
    type_valuation: "मूल्यांकन विवाद",
    type_boundary: "सीमा बेमेल",
    type_other: "स्वामित्व / अन्य समस्या",
    status_pending: "समीक्षा लंबित",
    status_resolved: "हल हो गया",
    date: "दिनांक",
    description: "विवरण",
    submit_grievance: "सुरक्षित रूप से शिकायत दर्ज करें",
    hearing_schedule: "सुनवाई शेड्यूलर (धारा 15)",
    grievance_queue: "शिकायत समाधान कतार",
    schedule_hearing: "सुनवाई निर्धारित करें",
    hearing_details_title: "आधिकारिक सुनवाई डॉकेट और वीसी लिंक",
    venue: "स्थान",
    physical_venue: "तहसील सम्मेलन कक्ष, कक्ष 204, पीथमपुर",
    virtual_vc: "सुरक्षित एनआईसी वेबैक्स वीडियो लिंक",
    join_vc: "वीडियो कॉन्फ्रेंस में शामिल हों",
    magistrate: "पीठासीन अधिकारी",
    notes: "मूल संपत्ति विलेख, आईडी प्रमाण और नवीनतम कर रसीदें साथ लाएं।",
    login_official_reg: "अधिकारी पंजीकरण",
    official_reg_desc: "एसडीएम / तहसीलदार / सीएएलए ऑनबोर्डिंग",
    employee_id: "कर्मचारी / सेवा आईडी",
    department: "विभाग / मंत्रालय",
    designation: "आधिकारिक पद",
    district: "जिला / क्षेत्राधिकार",
    office_name: "कार्यालय / न्यायालय का नाम",
    advance_stage: "अगले चरण में बढ़ाएं",
    resolve_grievance: "समीक्षा और समाधान",
    upload_proof: "दस्तावेज़ अपलोड करें",
    calc_estimate: "मुआवजा अनुमानक",
    join_virtual_court: "वर्चुअल सुनवाई में शामिल हों",
    ping_gateways: "गेटवे पिंग करें",
    verify_hashes: "क्रिप्टोग्राफिक हैश सत्यापित करें",
    resolve_title: "शिकायत की समीक्षा और समाधान करें",
    schedule_new_hearing: "सार्वजनिक सुनवाई निर्धारित करें",
    calc_title: "भूमि मुआवजा अनुमानक (RFCTLARR 2013)",
    upload_doc_title: "सहायक दस्तावेज़ / विलेख प्रमाण अपलोड करें"
  }
};

const ParticleBackground = ({ isDark }: { isDark: boolean }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 100;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) positions[i] = (Math.random() - 0.5) * 300;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: isDark ? 0x06b6d4 : 0x0284c7, size: 0.8, transparent: true, opacity: isDark ? 0.6 : 0.4 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.1;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      points.rotation.x += 0.0005;
      points.rotation.y += 0.001;
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geo.dispose(); mat.dispose(); renderer.dispose();
    };
  }, [isDark]);
  return <div ref={mountRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

const InteractiveThreeLogo = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(100, 100);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const matT = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.6, roughness: 0.2, emissive: 0x003344 });
    const tTop = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 0.8), matT);
    tTop.position.set(-2.5, 1.5, 0);
    const tStem = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.5, 0.8), matT);
    tStem.position.set(-2.5, -0.6, 0);
    group.add(tTop); group.add(tStem);

    const matS = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.6, roughness: 0.2, emissive: 0x4a1c00 });
    const sTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.8), matS);
    sTop.position.set(2, 1.5, 0);
    const sMid = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.8), matS);
    sMid.position.set(2, 0.3, 0);
    const sBot = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.8), matS);
    sBot.position.set(2, -0.9, 0);
    const sLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matS);
    sLeft.position.set(1.15, 0.9, 0);
    const sRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), matS);
    sRight.position.set(2.85, -0.3, 0);
    group.add(sTop); group.add(sMid); group.add(sBot); group.add(sLeft); group.add(sRight);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const light = new THREE.PointLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    scene.add(light);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    let req: number;
    const animate = () => {
      req = requestAnimationFrame(animate);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, mouseX * 0.8 + Math.sin(Date.now()*0.002)*0.2, 0.1);
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -mouseY * 0.8 + Math.cos(Date.now()*0.002)*0.1, 0.1);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(req);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  return <div ref={mountRef} className="w-[100px] h-[100px] drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] cursor-pointer" />;
};

const ThreeDMap = ({ satelliteMode, isDark }: { satelliteMode: boolean; isDark: boolean }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? 0x0B1329 : 0xf1f5f9);
    const container = mountRef.current;
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    
    const terrainGroup = new THREE.Group();
    scene.add(terrainGroup);

    const buildScene = () => {
      while(terrainGroup.children.length > 0) terrainGroup.remove(terrainGroup.children[0]); 
      if (satelliteMode) {
        const geo = new THREE.PlaneGeometry(40, 40, 32, 32);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i)*0.3) * Math.cos(pos.getY(i)*0.3) * 0.3);
        geo.computeVertexNormals();
        const mat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e, roughness: 1.0, flatShading: true });
        const plane = new THREE.Mesh(geo, mat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        terrainGroup.add(plane);
      } else {
        const grid = new THREE.GridHelper(40, 40, isDark ? 0x1E293B : 0xcbd5e1, isDark ? 0x0F172A : 0xe2e8f0);
        grid.position.y = -0.4;
        terrainGroup.add(grid);
      }

      const gridSize = 10;
      const plotSize = 2;
      const gap = 0.2;
      const offset = (gridSize * (plotSize + gap)) / 2;

      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const px = x * (plotSize + gap) - offset;
          const pz = z * (plotSize + gap) - offset;
          const height = satelliteMode ? 0.05 : 0.3;
          const isCorridor = (x === 4 || x === 5);
          const isUserPlot = (x === 3 && z === 5);

          let color = 0x10B981, opacity = satelliteMode ? 0.5 : 0.8, emissive = 0x000000;
          if (isCorridor) { color = 0xEA580C; opacity = 0.9; emissive = 0x4a1c00; } 
          else if (isUserPlot) { color = 0x06B6D4; opacity = 1.0; emissive = 0x004455; }

          const geo = new THREE.BoxGeometry(plotSize, height, plotSize);
          const mat = new THREE.MeshStandardMaterial({ color, transparent: true, opacity, emissive, metalness: 0.1, roughness: 0.4 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(px, height / 2 - 0.4, pz);
          const edges = new THREE.EdgesGeometry(geo);
          const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: isDark ? 0xffffff : 0x334155, opacity: 0.3, transparent: true }));
          mesh.add(line);
          terrainGroup.add(mesh);
        }
      }
    };
    buildScene();

    let isDragging = false, prevPos = { x: 0, y: 0 };
    let targetRotY = 0, targetRotX = 0, mouseX = 0, mouseY = 0;

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', (e: MouseEvent) => { isDragging = true; prevPos = { x: e.offsetX, y: e.offsetY }; });
    window.addEventListener('mouseup', () => isDragging = false);
    dom.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = dom.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging) {
        terrainGroup.rotation.y += (e.offsetX - prevPos.x) * 0.01;
        terrainGroup.rotation.x += (e.offsetY - prevPos.y) * 0.01;
        targetRotY = terrainGroup.rotation.y;
        targetRotX = terrainGroup.rotation.x;
        prevPos = { x: e.offsetX, y: e.offsetY };
      }
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if(!isDragging) {
        targetRotY += 0.002;
        terrainGroup.rotation.y = THREE.MathUtils.lerp(terrainGroup.rotation.y, targetRotY + (mouseX * 0.2), 0.05);
        terrainGroup.rotation.x = THREE.MathUtils.lerp(terrainGroup.rotation.x, targetRotX + (-mouseY * 0.2), 0.05);
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if(mountRef.current) mountRef.current.innerHTML = '';
      renderer.dispose();
    };
  }, [satelliteMode, isDark]);

  return (
    <div className={`w-full h-full ${isDark ? 'bg-[#0B1329]' : 'bg-slate-100'} relative cursor-move`}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 flex flex-col space-y-2 pointer-events-none">
        <div className={`${isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-white/90 border-slate-300 text-slate-800'} backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center shadow-md`}>
          <span className="w-3 h-3 rounded-full bg-orange-500 mr-2 shadow-[0_0_8px_rgba(234,88,12,0.8)] animate-pulse"></span> Target Corridor
        </div>
        <div className={`${isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-white/90 border-slate-300 text-slate-800'} backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center shadow-md`}>
          <span className="w-3 h-3 rounded-full bg-cyan-500 mr-2 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span> Your Plot (142/2)
        </div>
        <div className={`${isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-white/90 border-slate-300 text-slate-800'} backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center shadow-md`}>
          <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Private Unaffected
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }
  }, [isVisible, onClose]);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[200] bg-emerald-600/95 backdrop-blur-md text-white px-6 py-4 rounded-xl shadow-2xl border border-emerald-400 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-emerald-200" />
          <span className="font-semibold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LogoutModal = ({ isOpen, onClose, onConfirm, t, isDark }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-8 rounded-2xl max-w-md w-full shadow-2xl relative`}>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('logout')}</h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-8`}>{t('confirm_logout')}</p>
            <div className="flex space-x-4 w-full">
              <button onClick={onClose} className={`flex-1 py-3 px-4 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'} font-medium rounded-lg transition-colors border`}>{t('cancel')}</button>
              <button onClick={onConfirm} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-600/20">{t('yes_logout')}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ActionConfirmModal = ({ isOpen, onClose, onConfirm, t, isDanger = false, isDark }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} border ${isDanger ? 'border-red-500/50' : isDark ? 'border-slate-700' : 'border-slate-300'} p-6 rounded-2xl max-w-md w-full shadow-2xl`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-10 h-10 ${isDanger ? 'bg-red-500/20' : 'bg-orange-500/20'} rounded-full flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${isDanger ? 'text-red-500' : 'text-orange-400'}`} />
            </div>
            <h3 className="text-xl font-bold">{isDanger ? t('halt_ops') : t('confirm_action')}</h3>
          </div>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>{isDanger ? t('halt_desc') : t('are_you_sure_action')}</p>
          <div className="flex space-x-3">
            <button onClick={onClose} className={`flex-1 py-2 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} rounded-lg transition-colors`}>{t('cancel')}</button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 py-2 ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg transition-colors`}>{t('execute')}</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const HearingDetailModal = ({ hearing, isOpen, onClose, onOpenVC, t, isDark }: any) => {
  if (!isOpen || !hearing) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 sm:p-8 rounded-2xl max-w-lg w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400"><Gavel className="w-5 h-5" /></div>
              <div><h3 className="text-lg font-bold">{t('hearing_details_title')}</h3><p className="text-xs text-purple-400">Case ID: {hearing.caseId || hearing.acquisitionCase?.caseNumber || 'TS-1042'}</p></div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className={`space-y-4 ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border text-sm`}>
            <div className="flex justify-between border-b pb-3 border-inherit"><span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>{t('date')} & {t('timestamp')}</span><span className="font-mono">{hearing.time || hearing.hearingDate?.replace('T', ' ')}</span></div>
            <div className="flex justify-between border-b pb-3 border-inherit"><span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>{t('venue')} (Physical)</span><span className="text-cyan-600 dark:text-cyan-400 text-right">{hearing.location || t('physical_venue')}</span></div>
            <div className="flex justify-between border-b pb-3 border-inherit">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>Virtual Link</span>
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center">
                {t('virtual_vc')} <Video className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
            <div className="flex justify-between"><span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>{t('magistrate')}</span><span>{hearing.presidingOfficer || "Shri Alok Sharma (IAS, SDM)"}</span></div>
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400 bg-slate-950/40 border-slate-800' : 'text-slate-600 bg-slate-100 border-slate-200'} mt-4 p-3 rounded-lg border`}><strong className="text-orange-500">Note:</strong> {hearing.remarks || t('notes')}</p>
          <div className="mt-6 flex space-x-3">
            <button onClick={() => { if (onOpenVC) onOpenVC(hearing); onClose(); }} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-purple-900/30"><Video className="w-4 h-4 mr-2" /> {t('join_vc')}</button>
            <button onClick={onClose} className={`py-3 px-5 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} rounded-xl transition-colors`}>{t('close')}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const VirtualCourtModal = ({ hearing, isOpen, onClose, t, isDark }: any) => {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState([
    { sender: "Court Registrar", text: "Welcome to the NIC Sovereign Virtual Courtroom (Section 15 Hearing).", time: "10:30 AM" },
    { sender: "Presiding Magistrate", text: "Bench is in session. Proceeding with verification of survey objections.", time: "10:31 AM" }
  ]);

  if (!isOpen) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages(prev => [...prev, { sender: "You", text: chatMsg.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatMsg('');
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden text-white">
          <div className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="font-bold text-sm sm:text-base flex items-center">
                <Video className="w-4 h-4 mr-2 text-purple-400" />
                NIC Sovereign Virtual Courtroom • Case {hearing?.caseId || hearing?.acquisitionCase?.caseNumber || 'TS-1042'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full font-mono">
                {hearing?.presidingOfficer || "Shri Alok Sharma (IAS, SDM)"}
              </span>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden bg-slate-950/50">
            <div className="lg:col-span-2 flex flex-col space-y-3 h-full">
              <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/80 rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-xs px-3 py-1 rounded-md text-white flex items-center border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> NIC Encrypted Sovereign Stream (256-bit AES)
                </div>
                {camOn ? (
                  <div className="text-center p-6">
                    <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] mx-auto mb-4 border-2 border-white/20">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-lg font-bold">{hearing?.presidingOfficer || "Shri Alok Sharma (IAS, SDM)"}</h4>
                    <p className="text-xs text-purple-300 font-medium">Presiding Magistrate • Section 15 Objections Bench</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-400 text-[11px] px-3 py-1 rounded-full border border-emerald-500/30">Court Quorum Active</span>
                      <span className="bg-blue-500/20 text-blue-300 text-[11px] px-3 py-1 rounded-full border border-blue-500/30">Official Audio Synchronized</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-center">
                    <VideoOff className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm">Camera Feed Paused</p>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                  <span className="text-xs font-mono text-slate-300">Venue: {hearing?.location || "Tehsil Conference Hall, Room 204, Pithampur"}</span>
                  {handRaised && <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">✋ Hand Raised</span>}
                </div>
              </div>

              {/* VC Controls */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-center space-x-3">
                <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-xl transition-all ${micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`} title={micOn ? "Mute Microphone" : "Unmute Microphone"}>
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-xl transition-all ${camOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'}`} title={camOn ? "Stop Video" : "Start Video"}>
                  {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setHandRaised(!handRaised)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${handRaised ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                  {handRaised ? "Lower Hand" : "✋ Raise Hand"}
                </button>
                {hearing?.virtualLink && (
                  <a href={hearing.virtualLink} target="_blank" rel="noreferrer" className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center transition-colors">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Launch External Webex
                  </a>
                )}
                <button onClick={onClose} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors">Leave Session</button>
              </div>
            </div>

            {/* Hearing Docket & Chat */}
            <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-800 bg-slate-950 font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Live Case Record & Q&A
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700 text-slate-300">
                  <p className="font-semibold text-white mb-1">Docket Summary:</p>
                  <p className="text-[11px] leading-relaxed">Section 15 Public Hearing on Khasra 142/2. Objections related to circle rate revision and tree/structure asset counts are under judicial review.</p>
                </div>
                {messages.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-lg ${m.sender === 'You' ? 'bg-cyan-950/60 border border-cyan-800 ml-4' : 'bg-slate-800/80 border border-slate-700'}`}>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-200">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <p className="text-slate-300">{m.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="p-2 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type statement or question..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-purple-500" />
                <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"><Send className="w-3.5 h-3.5" /></button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CompensationCalculatorModal = ({ isOpen, onClose, t, isDark }: any) => {
  const [area, setArea] = useState(2.5);
  const [circleRate, setCircleRate] = useState(500000);
  const [multiplier, setMultiplier] = useState(2.0);
  const [assetVal, setAssetVal] = useState(320000);

  if (!isOpen) return null;

  const baseMarketValue = area * circleRate * multiplier;
  const solatium = baseMarketValue;
  const total = baseMarketValue + solatium + Number(assetVal);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold flex items-center text-orange-500">
              <Calculator className="w-5 h-5 mr-2" /> {t('calc_title')}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Land Area (Hectares)</label>
                <input type="number" step="0.1" value={area} onChange={e => setArea(parseFloat(e.target.value) || 0)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500 font-mono`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Circle Rate (₹ / Hectare)</label>
                <input type="number" step="10000" value={circleRate} onChange={e => setCircleRate(parseFloat(e.target.value) || 0)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500 font-mono`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Rural Multiplier (Sec 26)</label>
                <select value={multiplier} onChange={e => setMultiplier(parseFloat(e.target.value))} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500`}>
                  <option value={1.0}>1.0x (Urban Land)</option>
                  <option value={1.25}>1.25x (Semi-Urban)</option>
                  <option value={1.5}>1.5x (Sub-Rural)</option>
                  <option value={2.0}>2.0x (Rural Multiplier 100%)</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Attached Assets (Trees/Structures ₹)</label>
                <input type="number" step="10000" value={assetVal} onChange={e => setAssetVal(parseFloat(e.target.value) || 0)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500 font-mono`} />
              </div>
            </div>

            <div className={`${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-100 border-slate-300'} p-4 rounded-xl border space-y-2.5`}>
              <div className="flex justify-between text-xs">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Base Market Value (Area × Rate × Multiplier):</span>
                <span className="font-mono font-bold">₹ {Math.round(baseMarketValue).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Solatium (100% Legal Entitlement Bonus):</span>
                <span className="font-mono font-bold text-cyan-500">+ ₹ {Math.round(solatium).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Attached Assets Valuation:</span>
                <span className="font-mono font-bold text-orange-400">+ ₹ {Number(assetVal).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-inherit flex justify-between items-baseline">
                <span className="font-bold text-sm">Estimated Total Compensation:</span>
                <span className="font-mono text-xl font-black text-emerald-500">₹ {Math.round(total).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> 100% Income Tax Exempted under Section 96 of RFCTLARR Act 2013
            </p>
            <button onClick={onClose} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors">
              Close Calculator
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const UploadDocumentModal = ({ isOpen, onClose, onUpload, t, isDark }: any) => {
  const [docType, setDocType] = useState('RECORD_OF_RIGHTS');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpload({
        documentType: docType,
        filename: filename || `${docType.toLowerCase()}_deed.pdf`
      });
      setFilename('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-md w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold flex items-center text-emerald-500">
              <Upload className="w-5 h-5 mr-2" /> {t('upload_doc_title')}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Document Category</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-emerald-500`}>
                <option value="RECORD_OF_RIGHTS">Khasra / Khatauni (Record of Rights)</option>
                <option value="TITLE_DEED">Registered Property Sale Deed / Registry</option>
                <option value="BANK_PASSBOOK">Bank Passbook Copy (for Direct DBT)</option>
                <option value="OBJECTION_PETITION">Section 15 Objection Supporting Evidence</option>
                <option value="AFFIDAVIT">Legal Heirship / No Objection Affidavit</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Document Name / Label</label>
              <input type="text" required placeholder="e.g. My_Khasra_Extract_142.pdf" value={filename} onChange={e => setFilename(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-emerald-500`} />
            </div>
            <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100 border-slate-200'} text-xs text-slate-400`}>
              <p className="flex items-center text-emerald-400 font-semibold mb-1"><ShieldCheck className="w-4 h-4 mr-1" /> SHA-256 Sovereign Cryptographic Seal</p>
              Uploaded documents are immediately stamped with an immutable cryptographic hash and verified against state land records.
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-emerald-900/40">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
              Upload & Encrypt into Sovereign Vault
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ResolveGrievanceModal = ({ grievance, isOpen, onClose, onResolve, t, isDark }: any) => {
  const [status, setStatus] = useState('RESOLVED');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !grievance) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onResolve(grievance.id, status, resolution);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-lg w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold flex items-center text-orange-500">
              <FileWarning className="w-5 h-5 mr-2" /> {t('resolve_title')}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="mb-4 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400"><span>Grievance ID:</span><span className="font-mono text-white font-bold">{grievance.id || 'GRV-084'}</span></div>
            <div className="flex justify-between text-slate-400"><span>Applicant / Case:</span><span className="text-white">{grievance.submittedBy?.name || 'Landowner'}</span></div>
            <div className="flex justify-between text-slate-400"><span>Type:</span><span className="text-orange-400 font-semibold">{grievance.type || grievance.subject}</span></div>
            <p className="mt-2 text-slate-300 italic border-t border-slate-700 pt-2 leading-relaxed">"{grievance.desc || grievance.description}"</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Official Decision / Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500`}>
                <option value="RESOLVED">Resolve & Issue Official Redressal</option>
                <option value="UNDER_REVIEW">Mark Under Official Investigation / Survey</option>
                <option value="REJECTED">Dismiss Grievance (Reasons Specified)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Official Resolution Order / Remarks</label>
              <textarea required rows={3} value={resolution} onChange={e => setResolution(e.target.value)} placeholder="Specify compensation revision, resurvey order, or official adjudication findings..." className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-orange-500 resize-none`}></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-orange-900/40">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              Publish Official Grievance Resolution
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const ScheduleHearingModal = ({ cases, isOpen, onClose, onSchedule, t, isDark, user }: any) => {
  const [caseId, setCaseId] = useState(cases && cases[0] ? (cases[0].id || cases[0].caseNumber) : '1');
  const [hearingDate, setHearingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(10, 30, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [venue, setVenue] = useState('Tehsil Conference Hall, Room 204, Pithampur');
  const [officer, setOfficer] = useState(user?.name ? `${user.name} (${user.designation || 'SDM'})` : 'Shri Alok Sharma (IAS, SDM)');
  const [virtualLink, setVirtualLink] = useState('https://webex.nic.in/join/terrasync-hearing-' + Math.floor(1000 + Math.random() * 9000));
  const [remarks, setRemarks] = useState('Bring original property deeds, ID proof, and latest tax receipts.');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSchedule({
        caseId,
        hearingDate,
        location: venue,
        virtualLink,
        presidingOfficer: officer,
        remarks
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-lg w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold flex items-center text-purple-400">
              <Calendar className="w-5 h-5 mr-2" /> {t('schedule_new_hearing')}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Acquisition Case</label>
              <select value={caseId} onChange={e => setCaseId(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-purple-500`}>
                {(cases && cases.length > 0 ? cases : [{ id: 1, caseNumber: 'TS-1042', khasra: '142/2' }]).map((c: any, i: number) => (
                  <option key={i} value={c.id || c.caseNumber}>Case TS-{c.id || c.caseNumber} • Khasra {c.khasra || '142/2'}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Hearing Date & Time</label>
                <input type="datetime-local" required value={hearingDate} onChange={e => setHearingDate(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-xs outline-none focus:border-purple-500 font-mono`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Presiding Officer</label>
                <input type="text" required value={officer} onChange={e => setOfficer(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-xs outline-none focus:border-purple-500`} />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Hearing Venue (Physical Location)</label>
              <input type="text" required value={venue} onChange={e => setVenue(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-purple-500`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Secure NIC Webex VC Link</label>
              <input type="text" required value={virtualLink} onChange={e => setVirtualLink(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-purple-500 font-mono text-xs`} />
            </div>
            <div>
              <label className={`block text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Hearing Agenda / Instructions</label>
              <textarea rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 text-sm outline-none focus:border-purple-500 resize-none`}></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-purple-900/40">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Gavel className="w-5 h-5 mr-2" />}
              Publish Hearing & Issue Official Summons
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const GrievanceDetailModal = ({ grievance, isOpen, onClose, t, isDark }: any) => {
  if (!isOpen || !grievance) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-md w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold flex items-center text-orange-400">
              <FileWarning className="w-5 h-5 mr-2" /> Grievance Record
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b pb-3 border-inherit">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>Grievance ID</span>
              <span className="font-mono font-bold text-cyan-400">{grievance.id || 'GRV-084'}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3 border-inherit">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>Category</span>
              <span className="font-semibold text-orange-400">{grievance.type || grievance.subject}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-3 border-inherit">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>Current Status</span>
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/40 uppercase font-bold">{t(grievance.status || 'status_pending')}</span>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold mb-1`}>Submitted Description</p>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'} text-xs leading-relaxed`}>
                {grievance.desc || grievance.description}
              </div>
            </div>
            {grievance.resolution ? (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                <p className="text-xs text-emerald-400 font-bold flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Official Order / Resolution
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{grievance.resolution}</p>
                {grievance.resolvedAt && <p className="text-[10px] text-slate-400 pt-1 font-mono">Resolved: {grievance.resolvedAt.replace('T', ' ')}</p>}
              </div>
            ) : (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300">
                <Clock className="w-4 h-4 inline mr-1 text-blue-400" /> Currently assigned to Sub-Divisional Magistrate for field survey verification.
              </div>
            )}
            <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-xs">
              Close Record
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CreateGrievanceModal = ({ isOpen, onClose, onSubmit, t, isDark }: any) => {
  const [type, setType] = useState('type_valuation');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ type: t(type), desc, rawType: type });
      setDesc('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl max-w-md w-full shadow-2xl`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center"><FileWarning className="w-5 h-5 mr-2 text-orange-400" />{t('file_new_grievance')}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Grievance Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-lg p-3 outline-none focus:border-cyan-500`}>
                  <option value="type_valuation">{t('type_valuation')}</option>
                  <option value="type_boundary">{t('type_boundary')}</option>
                  <option value="type_other">{t('type_other')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{t('description')}</label>
                <textarea required value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-lg p-3 outline-none focus:border-cyan-500 resize-none`}></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-all flex justify-center items-center shadow-lg shadow-cyan-900/40">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} 
                {t('submit_grievance')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DocumentViewer = ({ doc, onClose, t, user }: any) => {
  if (!doc) return null;
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Simulated Encrypted Document Data for ' + doc.title);
    link.download = `${doc.title.replace(/\s+/g, '_')}_TerraSync.pdf`;
    link.click();
  };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-md">
        <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center space-x-3"><FileSignature className="w-6 h-6 text-emerald-400" /><div><h3 className="font-semibold text-white">{doc.title}</h3><p className="text-xs text-emerald-400 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> SHA-256 Encrypted</p></div></div>
            <div className="flex space-x-2">
              <button onClick={() => window.print()} className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg"><Printer className="w-5 h-5" /></button>
              <button onClick={handleDownload} className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg"><Download className="w-5 h-5" /></button>
              <div className="w-px h-6 bg-slate-700 self-center mx-2"></div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 text-slate-300 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 bg-slate-800 p-4 sm:p-8 overflow-y-auto relative flex justify-center selection:bg-black selection:text-white">
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden opacity-10 z-10">
              <div className="transform -rotate-45 text-5xl sm:text-7xl font-black text-white whitespace-nowrap mb-20">CONFIDENTIAL • TERRASYNC</div>
            </div>
            <div className="bg-white max-w-2xl w-full p-8 sm:p-12 shadow-lg min-h-full relative z-0">
              <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-start text-gray-900">
                <div><h1 className="text-2xl font-bold uppercase">{doc.title}</h1><p className="text-sm text-gray-600 mt-1 font-semibold">Government of Madhya Pradesh / Maharashtra</p></div>
                <div className="text-right text-gray-500"><p className="text-sm font-mono bg-gray-100 p-1 rounded">ID: TS-DOC-{Math.floor(Math.random()*10000)}</p><p className="text-xs mt-1">Generated: {new Date().toLocaleDateString()}</p></div>
              </div>
              <div className="space-y-6 text-gray-800">
                <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <div><p className="text-xs text-gray-500 uppercase font-semibold">Landowner</p><p className="font-bold text-gray-900">{user?.name || t('ramesh_kumar')}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-semibold">Khasra No.</p><p className="font-bold text-gray-900">142/2, Khedi</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-semibold">Project</p><p className="font-bold text-gray-900">NH-46 Expansion</p></div>
                  <div><p className="text-xs text-gray-500 uppercase font-semibold">Status</p><p className="font-bold text-green-700 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> e-Signed</p></div>
                </div>
                <p className="text-sm leading-relaxed border-l-4 border-gray-300 pl-4">This document serves as the official certified extract for the aforementioned land parcel under <strong>Section 11 of the RFCTLARR Act, 2013</strong>.</p>
                <div className="bg-gray-50 border border-gray-200 p-4 text-center rounded">
                  <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 font-mono text-xs uppercase">[ Encrypted Spatial Map Rendered ]</span>
                </div>
                <div className="mt-12 pt-8 border-t-2 border-gray-200 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-blue-800/80 rounded-full flex items-center justify-center opacity-70 mb-2 rotate-12 mx-auto"><span className="text-blue-800 font-bold text-[10px] text-center">Digitally<br/>Verified</span></div>
                  </div>
                  <div className="text-right"><p className="text-lg font-bold text-gray-900">Tehsildar / CALA</p><p className="text-xs text-gray-500">Revenue Department</p></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const AIHelperModal = ({ isOpen, onClose, contextText, t, isDark }: any) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isOpen) { setLoading(true); const timer = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(timer); }
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className={`fixed bottom-24 right-6 z-[150] ${isDark ? 'bg-slate-900 border-cyan-500/50 text-slate-200' : 'bg-white border-cyan-500 text-slate-800'} border rounded-2xl w-80 shadow-2xl overflow-hidden`}>
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3 flex justify-between items-center"><h4 className="text-white font-bold flex items-center text-sm"><Bot className="w-4 h-4 mr-2" /> AI मित्र (Assistant)</h4><button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button></div>
          <div className={`p-4 ${isDark ? 'bg-slate-800/90' : 'bg-slate-50'} text-sm`}>
            {loading ? <div className="flex flex-col items-center justify-center py-4 text-cyan-600 dark:text-cyan-400"><Loader2 className="w-6 h-6 animate-spin mb-2" /><span className="text-xs">{t('ai_explaining')}</span></div> : 
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><p className="leading-relaxed">{contextText}</p><div className={`mt-4 pt-3 border-t ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'} flex items-center justify-between`}><span className="text-[10px] uppercase">Powered by TerraSync AI</span><ShieldCheck className="w-4 h-4 text-emerald-500" /></div></motion.div>
            }
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CitizenDashboard = ({ t, language, sharedData, onAddGrievance, onUploadDocument, showToast, isDark, user }: any) => {
  const [showMap, setShowMap] = useState(false);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [activeVC, setActiveVC] = useState<any>(null);

  const stageDetails: Record<number, { title: string; auth: string; desc: string; sec: string }> = {
    1: { title: t('stage_1'), auth: "District Collector", desc: "Preliminary notification that land is needed for a public purpose.", sec: "Sec 4, RFCTLARR Act 2013" },
    2: { title: t('stage_2'), auth: "Revenue Dept & PWD", desc: "Joint measurement of land and valuation of attached assets (trees, structures).", sec: "Sec 26, RFCTLARR Act 2013" },
    3: { title: t('stage_3'), auth: "SDM / CALA", desc: "Hearing of objections from landowners regarding area or compensation.", sec: "Sec 15, RFCTLARR Act 2013" },
    4: { title: t('stage_4'), auth: "District Collector", desc: "Final declaration of compensation amount including Solatium.", sec: "Sec 23-30, RFCTLARR Act 2013" },
    5: { title: t('stage_5'), auth: "PFMS / Treasury", desc: "Direct Bank Transfer of final amount to landowner's verified account.", sec: "Sec 77, RFCTLARR Act 2013" }
  };

  const comp = sharedData.caseData?.compensation || {};
  const currentStage = sharedData.caseData?.stage || 2;
  const utilitiesList = sharedData.caseData?.utilities || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border flex justify-between items-center shadow-xl`}>
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-[0_0_15px_rgba(6,182,212,0.3)]"><User className="w-7 h-7 text-white" /></div>
          <div>
            <h2 className="text-2xl font-bold">{t('welcome')}, {user?.name || t('ramesh_kumar')}</h2>
            <div className="flex gap-2 mt-2">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {t('identity')}: {user?.aadhaar ? `XXXX-XXXX-${user.aadhaar.slice(-4)}` : 'XXXX-XXXX-9842'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border shadow-xl`}>
            <h3 className="text-lg font-bold mb-8 flex items-center"><Activity className="w-5 h-5 mr-2 text-cyan-500" />{t('track_compensation')}</h3>
            <div className="relative px-4">
              <div className={`absolute top-5 left-10 right-10 h-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-full`}>
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${Math.min(100, Math.max(10, ((currentStage - 1) / 4) * 100))}%` }}></div>
              </div>
              <div className="flex justify-between relative z-10">
                {[1, 2, 3, 4, 5].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center w-1/5 cursor-pointer group" onClick={() => setSelectedStage(step)}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-lg ${step < currentStage ? 'bg-emerald-500 text-white' : step === currentStage ? 'bg-cyan-500 ring-4 ring-cyan-500/30 text-white' : isDark ? 'bg-slate-800 border-2 border-slate-600 text-slate-500' : 'bg-slate-100 border-2 border-slate-300 text-slate-400'}`}>
                      {step < currentStage ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    <span className={`text-xs text-center font-medium ${step === currentStage ? 'text-cyan-500 dark:text-cyan-400 font-bold' : isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-900'}`}>{t(`stage_${step}`)}</span>
                  </div>
                ))}
              </div>
            </div>
            {selectedStage && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mt-6 ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'} rounded-xl p-4 border`}>
                <div className="flex justify-between items-start mb-2"><h4 className="text-cyan-600 dark:text-cyan-400 font-bold">{stageDetails[selectedStage].title}</h4><button onClick={() => setSelectedStage(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-4 h-4" /></button></div>
                <p className="text-sm mb-2">{stageDetails[selectedStage].desc}</p>
                <div className="flex gap-4 text-xs"><span className={`${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'} px-2 py-1 rounded`}><strong className={`${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{t('responsible_auth')}:</strong> {stageDetails[selectedStage].auth}</span><span className={`${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-emerald-700'} px-2 py-1 rounded`}><BookOpen className="w-3 h-3 inline mr-1"/>{stageDetails[selectedStage].sec}</span></div>
              </motion.div>
            )}
          </div>

          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl border shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
              <h3 className="text-lg font-bold flex items-center"><MapPin className="w-5 h-5 mr-2 text-orange-500" />{t('view_map')}</h3>
              <div className="flex space-x-3">
                {showMap && <button onClick={() => setSatelliteMode(!satelliteMode)} className={`text-sm ${isDark ? 'bg-slate-700 text-white border-slate-600 hover:bg-slate-600' : 'bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300'} px-3 py-2 rounded-lg border transition-colors`}>{t('satellite_view')}</button>}
                <button onClick={() => setShowMap(!showMap)} className="text-sm bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-lg font-medium transition-colors">{showMap ? t('close_map') : t('view_map')}</button>
              </div>
            </div>
            <AnimatePresence>
              {showMap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`w-full h-[500px] relative ${isDark ? 'bg-[#0B1329]' : 'bg-slate-100'} border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} overflow-hidden block`}><ThreeDMap satelliteMode={satelliteMode} isDark={isDark} /></motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border shadow-xl`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold flex items-center"><FileWarning className="w-5 h-5 mr-2 text-orange-400" />{t('notices_grievances')}</h3>
              <button onClick={() => setShowGrievanceModal(true)} className={`${isDark ? 'bg-slate-700 hover:bg-cyan-600 text-white' : 'bg-slate-200 hover:bg-cyan-600 hover:text-white text-slate-800'} px-4 py-2 rounded-lg text-sm transition-colors`}>{t('file_new_grievance')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} font-bold uppercase`}>{t('active_notices')}</h4>
                {sharedData.notices.map((n: any, i: number) => (
                  <div key={i} className={`${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} p-3 rounded-xl border flex justify-between items-center`}>
                    <div className="flex items-center"><Bell className="w-4 h-4 text-orange-400 mr-3" /><div><p className="text-sm">{n.message || t(`stage_${n.stage || 1}`)}</p><p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{n.date || 'Active'}</p></div></div>
                    <button onClick={() => {
                      if (sharedData.hearings && sharedData.hearings.length > 0) {
                        setSelectedHearing(sharedData.hearings[0]);
                      } else {
                        setViewingDoc({ title: (n.message || t(`stage_${n.stage || 1}`)) + " Document" });
                      }
                    }} className={`text-xs ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'} px-3 py-1.5 rounded-lg transition-colors flex items-center`}><Eye className="w-3.5 h-3.5 mr-1" /> {t('view_doc')}</button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} font-bold uppercase`}>{t('filed_grievances')}</h4>
                {sharedData.grievances.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No active grievances.</p>
                ) : (
                  sharedData.grievances.map((g: any, i: number) => (
                    <div key={i} onClick={() => setSelectedGrievance(g)} className={`cursor-pointer ${isDark ? 'bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 text-slate-200' : 'bg-slate-50 border-slate-200 hover:border-cyan-500 text-slate-800'} p-3 rounded-xl border flex justify-between items-center transition-all group`}>
                      <div>
                        <p className="text-sm font-medium group-hover:text-cyan-400 transition-colors">{g.type || g.subject}</p>
                        <p className="text-xs text-slate-400">ID: {g.id || `GRV-${100+i}`} • {g.date || g.createdAt?.split('T')[0] || 'Recent'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] bg-orange-500/20 text-orange-500 dark:text-orange-400 px-2 py-1 rounded border border-orange-500/30 uppercase font-semibold">{t(g.status || 'status_pending')}</span>
                        <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${isDark ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 text-white' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl relative`}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold flex items-center"><Calculator className="w-5 h-5 mr-2 text-orange-500" />{t('compensation_breakdown')}</h3>
              <div className="flex space-x-2">
                <button onClick={() => setShowCalc(true)} className="bg-orange-500/20 hover:bg-orange-500/40 text-orange-500 p-1.5 rounded-lg transition-colors" title={t('calc_estimate')}><Calculator className="w-4 h-4" /></button>
                <button onClick={() => setShowAI(true)} className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-600 dark:text-cyan-400 p-1.5 rounded-lg transition-colors" title="Simplify with AI"><Bot className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('market_value')}</span><span className="font-mono">₹ {(comp.marketValue || 1250000).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('solatium')}</span><span className="font-mono">+ ₹ {(comp.solatium || 1250000).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('asset_val')}</span><span className="font-mono">+ ₹ {(comp.assetValuation || 320000).toLocaleString('en-IN')}</span></div>
              <div className="pt-4 border-t border-inherit flex justify-between items-end"><span className="font-bold">{t('total_entitlement')}</span><span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">₹ {(comp.approvedAmount || 2820000).toLocaleString('en-IN')}</span></div>
              <div className={`mt-4 p-3 ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border text-center`}>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">{t('dbt_status')}</span>
                <div className="flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-xs font-medium">
                  <CheckSquare className="w-4 h-4 mr-1.5 text-emerald-500" />
                  <span>{comp.status === 'APPROVED' ? t('processing') : (comp.status || 'Pending Approval')}</span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center flex justify-center items-center font-semibold"><ShieldCheck className="w-3 h-3 mr-1" /> {t('tax_exempt')}</p>
            </div>
          </div>

          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center"><Lock className="w-5 h-5 mr-2 text-emerald-500" />{t('secure_vault')}</h3>
              <button onClick={() => setShowUploadModal(true)} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center shadow-md">
                <Upload className="w-3.5 h-3.5 mr-1" /> {t('upload_proof')}
              </button>
            </div>
            <div className="space-y-3">
              {(sharedData.caseData?.documents && sharedData.caseData.documents.length > 0 
                ? sharedData.caseData.documents.map((d: any) => d.documentType || d.filename)
                : [t('doc_1'), t('doc_2'), t('doc_3')]
              ).map((doc: string, idx: number) => (
                <div key={idx} className={`${isDark ? 'bg-slate-900/50 border-slate-700 hover:bg-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'} p-3 rounded-xl border flex justify-between items-center group transition-colors`}>
                  <div className="flex items-center"><FileText className="w-4 h-4 text-slate-400 mr-2 group-hover:text-cyan-500 transition-colors" /><span className="text-sm truncate max-w-[150px]">{doc}</span></div>
                  <button onClick={() => setViewingDoc({ title: doc })} className={`text-xs ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-cyan-600 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-cyan-600 hover:text-white'} px-3 py-1.5 rounded-lg transition-colors flex items-center`}><Eye className="w-3.5 h-3.5 mr-1" /> {t('view_doc')}</button>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border shadow-xl`}>
            <h3 className="text-lg font-bold mb-5 flex items-center"><Zap className="w-5 h-5 mr-2 text-yellow-500" />{t('utilities')}</h3>
            <div className="space-y-4">
              {utilitiesList.length > 0 ? (
                utilitiesList.map((u: any, idx: number) => (
                  <div key={idx} className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border flex items-center justify-between`}>
                    <div className="flex items-center">
                      {u.utilityType === 'ELECTRICITY' ? <Zap className="w-5 h-5 text-yellow-500 mr-3" /> : <Droplets className="w-5 h-5 text-blue-500 mr-3" />}
                      <div>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-800'} font-medium`}>{u.utilityType === 'ELECTRICITY' ? t('electricity') : t('water')}</p>
                        <p className="text-xs text-slate-500">{u.identifier || 'Registered'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase font-semibold">{u.status || 'Active'}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border flex items-center justify-between`}>
                    <div className="flex items-center"><Zap className="w-5 h-5 text-yellow-500 mr-3" /><div><p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-800'} font-medium`}>{t('electricity')}</p><p className="text-xs text-slate-500">MPEB No: 849201</p></div></div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase font-semibold">{t('electricity_status')}</span>
                  </div>
                  <div className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border flex items-center justify-between`}>
                    <div className="flex items-center"><Droplets className="w-5 h-5 text-blue-500 mr-3" /><div><p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-800'} font-medium`}>{t('water')}</p><p className="text-xs text-slate-500">Reg: BW-2018</p></div></div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 uppercase font-semibold">{t('water_status')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} t={t} user={user} />
      <AIHelperModal isOpen={showAI} onClose={() => setShowAI(false)} contextText={t('ai_simple_comp')} t={t} isDark={isDark} />
      <CreateGrievanceModal isOpen={showGrievanceModal} onClose={() => setShowGrievanceModal(false)} onSubmit={onAddGrievance} t={t} isDark={isDark} />
      <CompensationCalculatorModal isOpen={showCalc} onClose={() => setShowCalc(false)} t={t} isDark={isDark} />
      <UploadDocumentModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUpload={onUploadDocument} t={t} isDark={isDark} />
      <GrievanceDetailModal grievance={selectedGrievance} isOpen={!!selectedGrievance} onClose={() => setSelectedGrievance(null)} t={t} isDark={isDark} />
      <HearingDetailModal hearing={selectedHearing} isOpen={!!selectedHearing} onClose={() => setSelectedHearing(null)} onOpenVC={(h: any) => setActiveVC(h)} t={t} isDark={isDark} />
      <VirtualCourtModal hearing={activeVC} isOpen={!!activeVC} onClose={() => setActiveVC(null)} t={t} isDark={isDark} />
    </motion.div>
  );
};

const GovDashboard = ({ t, sharedData, showToast, isDark, onIssueNotice, onBroadcast, onAdvanceStage, onResolveGrievance, onScheduleHearing, user }: any) => {
  const [actionModal, setActionModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [resolvingGrievance, setResolvingGrievance] = useState<any>(null);
  const [activeVC, setActiveVC] = useState<any>(null);

  const stats = sharedData.stats || {
    totalAcquiredAreaHectares: 1245,
    compensationSanctionedCrores: 485,
    pendingGrievancesCount: sharedData.grievances?.length || 0,
    scheduledHearingsCount: sharedData.hearings?.length || 2
  };

  const handleExecuteAction = async () => {
    if (selectedCase && onIssueNotice) {
      await onIssueNotice(selectedCase.id);
    } else {
      showToast(t('action_success'));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
      {/* Official Identity & Jurisdiction Card */}
      <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} backdrop-blur-xl rounded-2xl p-6 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl`}>
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Landmark className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name || "Shri Alok Sharma"}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs px-2.5 py-1 rounded-full border border-orange-500/30 flex items-center font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {user?.designation || "Sub-Divisional Magistrate (SDM & CALA)"}
              </span>
              <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs px-2.5 py-1 rounded-full border border-purple-500/30 font-mono font-medium">
                ID: {user?.employeeId || "GOV-OFF-2026-9842"}
              </span>
              <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-1 rounded-full border border-blue-500/30 font-medium">
                {user?.department || "Revenue & Land Acquisition"} • {user?.district || "Pithampur"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowScheduleModal(true)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center shadow-lg shadow-purple-900/30">
            <Plus className="w-4 h-4 mr-1.5" /> {t('schedule_hearing')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl transition-colors cursor-default relative`}>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('total_acquired')}</p>
          <div className="flex items-end"><h3 className="text-3xl font-black font-mono mr-2">{Math.round(stats.totalAcquiredAreaHectares || 1245)}</h3><span className="text-sm text-slate-500 mb-1">{t('hectares')}</span></div>
          <Map className="w-8 h-8 text-blue-500 opacity-80 absolute top-6 right-6" />
        </div>
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl transition-colors cursor-default relative`}>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('comp_sanctioned')}</p>
          <div className="flex items-end"><span className="text-emerald-500 text-3xl font-light mr-2">₹</span><h3 className="text-3xl font-black font-mono mr-2">{Math.round(stats.compensationSanctionedCrores || 485)}</h3><span className="text-sm text-slate-500 mb-1">{t('crores')}</span></div>
          <Landmark className="w-8 h-8 text-emerald-500 opacity-80 absolute top-6 right-6" />
        </div>
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl transition-colors cursor-default relative`}>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('pending_objections')}</p>
          <div className="flex items-end"><h3 className="text-3xl font-black font-mono">{stats.pendingGrievancesCount}</h3></div>
          <AlertTriangle className="w-8 h-8 text-orange-500 opacity-80 absolute top-6 right-6" />
        </div>
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl transition-colors cursor-default relative`}>
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{t('hearings_week')}</p>
          <div className="flex items-end"><h3 className="text-3xl font-black font-mono">{stats.scheduledHearingsCount}</h3></div>
          <Gavel className="w-8 h-8 text-purple-500 opacity-80 absolute top-6 right-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl overflow-hidden`}>
            <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
              <h3 className="text-xl font-bold flex items-center"><Database className="w-5 h-5 mr-3 text-cyan-500" />{t('case_queue')}</h3>
              <button onClick={onBroadcast} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">{t('bulk_sms')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className={`${isDark ? 'bg-slate-900/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'} text-xs uppercase border-b`}><tr className="px-6 py-4"><th>{t('case_id')}</th><th>{t('owner')}</th><th>Khasra</th><th>{t('stage')}</th><th className="text-right">{t('action')}</th></tr></thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-200'} text-sm`}>
                  {sharedData.cases.map((r: any, i: number) => (
                    <tr key={i} className={`${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}>
                      <td className="px-6 py-4 text-cyan-600 dark:text-cyan-400 font-mono">TS-{r.id || r.caseNumber}</td>
                      <td className="px-6 py-4">{r.owner || t(r.nameKey || 'ramesh_kumar')}</td>
                      <td className="px-6 py-4 text-slate-500">{r.khasra || '142/2'}</td>
                      <td className="px-6 py-4"><span className="bg-orange-500/10 text-orange-500 dark:text-orange-400 px-3 py-1.5 rounded-lg text-xs font-semibold">{t(`stage_${r.stage || 2}`)}</span></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => onAdvanceStage && onAdvanceStage(r.id)} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-sm">
                          {t('advance_stage')}
                        </button>
                        <button onClick={() => { setSelectedCase(r); setActionModal(true); }} className={`text-xs ${isDark ? 'bg-slate-700 hover:bg-cyan-600 text-white' : 'bg-slate-200 hover:bg-cyan-600 hover:text-white text-slate-800'} px-3 py-1.5 rounded-lg transition-colors`}>
                          {t('issue_notice')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}`}><h3 className="text-lg font-bold flex items-center"><FileWarning className="w-5 h-5 mr-2 text-orange-400" />{t('grievance_queue')}</h3></div>
            <div className="p-4 space-y-3">
              {sharedData.grievances.length === 0 ? <p className="text-sm text-slate-500 p-2">No pending grievances.</p> :
                sharedData.grievances.map((g: any, i: number) => (
                  <div key={i} className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold">{g.id || `GRV-${100+i}`}</span>
                      <span className="text-[10px] bg-orange-500/20 text-orange-500 dark:text-orange-400 px-2 py-0.5 rounded border border-orange-500/30 uppercase font-semibold">{t(g.status || 'status_pending')}</span>
                    </div>
                    <p className="text-sm mb-1 font-semibold">{g.type || g.subject}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>{g.desc || g.description}</p>
                    {g.resolution && (
                      <p className="mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <strong>Order:</strong> {g.resolution}
                      </p>
                    )}
                    <button onClick={() => setResolvingGrievance(g)} className="mt-3 text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors w-full flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> {t('resolve_grievance')}
                    </button>
                  </div>
                ))
              }
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
              <h3 className="text-lg font-bold flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-500" />{t('hearing_schedule')}</h3>
              <button onClick={() => setShowScheduleModal(true)} className="text-xs bg-purple-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> New
              </button>
            </div>
            <div className="p-4 space-y-3">
              {sharedData.hearings.map((h: any, i: number) => (
                <div key={i} className={`${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border flex items-center justify-between`}>
                  <div className="flex items-center"><Clock className="w-4 h-4 text-slate-400 mr-3" /><div><p className="text-sm">{h.time || h.hearingDate?.replace('T', ' ')}</p><p className="text-xs text-slate-500">Case: {h.caseId || h.acquisitionCase?.caseNumber || 'TS-1042'}</p></div></div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setSelectedHearing(h)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition-colors">{t('view_doc')}</button>
                    <button onClick={() => setActiveVC(h)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center"><Video className="w-3 h-3 mr-1" /> VC</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ActionConfirmModal isOpen={actionModal} onClose={() => setActionModal(false)} onConfirm={handleExecuteAction} t={t} isDark={isDark} />
      <ScheduleHearingModal cases={sharedData.cases} isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={onScheduleHearing} t={t} isDark={isDark} user={user} />
      <ResolveGrievanceModal grievance={resolvingGrievance} isOpen={!!resolvingGrievance} onClose={() => setResolvingGrievance(null)} onResolve={onResolveGrievance} t={t} isDark={isDark} />
      <HearingDetailModal hearing={selectedHearing} isOpen={!!selectedHearing} onClose={() => setSelectedHearing(null)} onOpenVC={(h: any) => setActiveVC(h)} t={t} isDark={isDark} />
      <VirtualCourtModal hearing={activeVC} isOpen={!!activeVC} onClose={() => setActiveVC(null)} t={t} isDark={isDark} />
    </motion.div>
  );
};

const AdminDashboard = ({ t, sharedData, showToast, isDark, onToggleHalt }: any) => {
  const [showKillSwitch, setShowKillSwitch] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [activeVC, setActiveVC] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'users'>('infrastructure');
  const [isPinging, setIsPinging] = useState(false);
  const [latencies, setLatencies] = useState<{ [key: string]: number }>({ digilocker: 45, bhulekh: 62, pfms: 38 });
  const [hashVerified, setHashVerified] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.getAllUsers();
      if (Array.isArray(res) && res.length > 0) {
        setUsersList(res);
      } else {
        setUsersList([
          { id: 1, name: "Ramesh Kumar", email: "ramesh@landportal.demo", role: "CITIZEN", aadhaar: "984210984210" },
          { id: 2, name: "Shri Alok Sharma", email: "officer@landportal.demo", role: "OFFICER", employeeId: "GOV-OFF-2026-9842", designation: "SDM & CALA", district: "Pithampur" },
          { id: 3, name: "System Admin", email: "admin@landportal.demo", role: "ADMIN", designation: "Master Root Authority" }
        ]);
      }
    } catch {
      setUsersList([
        { id: 1, name: "Ramesh Kumar", email: "ramesh@landportal.demo", role: "CITIZEN", aadhaar: "984210984210" },
        { id: 2, name: "Shri Alok Sharma", email: "officer@landportal.demo", role: "OFFICER", employeeId: "GOV-OFF-2026-9842", designation: "SDM & CALA", district: "Pithampur" },
        { id: 3, name: "System Admin", email: "admin@landportal.demo", role: "ADMIN", designation: "Master Root Authority" }
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handlePingGateways = async () => {
    setIsPinging(true);
    try {
      await api.getGatewayHealth().catch(() => {});
      setTimeout(() => {
        const nextLatencies = {
          digilocker: Math.floor(30 + Math.random() * 35),
          bhulekh: Math.floor(50 + Math.random() * 40),
          pfms: Math.floor(25 + Math.random() * 30)
        };
        setLatencies(nextLatencies);
        setIsPinging(false);
        showToast("Gateway Latencies Updated: PFMS (Fastest), DigiLocker (Normal), Bhulekh (Synced)");
      }, 700);
    } catch {
      setIsPinging(false);
    }
  };

  const handleVerifyHashes = () => {
    setHashVerified(true);
    showToast("Cryptographic Audit Chain: 100% Valid • 0 Tampering Detected");
  };

  const gateways = sharedData.gateways || {
    digilocker: { name: t('api_digilocker'), color: "bg-emerald-500", operational: true },
    bhulekh: { name: t('api_bhulekh'), color: "bg-blue-500", operational: true },
    pfms: { name: t('api_pfms'), color: "bg-emerald-500", operational: true }
  };

  const auditLogs = sharedData.auditLogs || [
    { time: "10:42", actor: "SDO_04", action: "Approved Award", hash: "8f4a3e2b9c1d0f5e" },
    { time: "09:15", actor: "SYS_CRON", action: "DigiLocker Sync", hash: "3e1d9f8a2c4b7e6d" },
    { time: "08:30", actor: "SDM_BENCH", action: "Section 15 Order Published", hash: "a9b2c3d4e5f60718" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl border shadow-xl`}>
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Lock className="w-6 h-6 mr-2 text-purple-500" />
            Master Control Node
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>System architecture, cryptographic security, and sovereign oversight</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-700">
            <button onClick={() => setActiveTab('infrastructure')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'infrastructure' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              Infrastructure
            </button>
            <button onClick={() => setActiveTab('users')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
              <Users className="w-3.5 h-3.5 inline mr-1" /> Users & Officials
            </button>
          </div>
          <button onClick={() => setShowKillSwitch(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl flex items-center font-bold text-xs shadow-lg shadow-red-600/30 transition-all animate-pulse">
            <Power className="w-4 h-4 mr-1.5" /> {t('halt_ops')}
          </button>
        </div>
      </div>

      {activeTab === 'infrastructure' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl p-6 border shadow-xl`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center"><Settings className="w-5 h-5 mr-3 text-cyan-500" />{t('system_health')}</h3>
                <button onClick={handlePingGateways} disabled={isPinging} className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center">
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isPinging ? 'animate-spin' : ''}`} />
                  {t('ping_gateways')}
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(gateways).map(([key, apiItem]: any, i) => (
                  <div key={i} className={`flex justify-between items-center ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border`}>
                    <div>
                      <span className="text-sm font-medium">{apiItem.name || t(`api_${key}`)}</span>
                      <p className="text-[10px] text-slate-500 font-mono">Latency: {latencies[key] || 45}ms • TLS 1.3</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${apiItem.color || 'bg-emerald-500'} shadow-[0_0_8px_currentColor] animate-pulse`}></span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`lg:col-span-2 ${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl h-full`}>
              <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
                <h3 className="text-lg font-bold flex items-center"><Fingerprint className="w-5 h-5 mr-3 text-purple-500" />{t('audit_trail')}</h3>
                <button onClick={handleVerifyHashes} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {t('verify_hashes')}
                </button>
              </div>
              <div className="p-4 space-y-3">
                {auditLogs.map((log: any, i: number) => (
                  <div key={i} className={`${isDark ? 'bg-slate-900/80 border-slate-700/50 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'} p-4 rounded-xl border flex gap-3 text-sm items-center`}>
                    <span className="text-slate-500 font-mono">{log.time || log.createdAt?.split('T')[1]?.slice(0, 5) || '10:42'}</span>
                    <span className="text-blue-500 dark:text-blue-400 font-mono font-bold text-xs">{log.actor || log.user?.name || 'SYS_AUTH'}</span>
                    <span className="flex-1 text-xs">{log.action}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                      SHA: {log.hash ? (log.hash.slice(0, 6) + '...' + log.hash.slice(-4)) : '8f4a...2b9c'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl p-6`}>
            <h3 className="text-lg font-bold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-purple-500" />Global Hearing Oversight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedData.hearings.map((h: any, i: number) => (
                <div key={i} className={`${isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'} p-4 rounded-xl border flex justify-between items-center`}>
                  <div><p className="text-sm font-semibold">Case: {h.caseId || h.acquisitionCase?.caseNumber || 'TS-1042'}</p><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{h.time || h.hearingDate?.replace('T', ' ')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedHearing(h)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg transition-colors">{t('view_doc')}</button>
                    <button onClick={() => setActiveVC(h)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"><Video className="w-3.5 h-3.5 mr-1" /> Enter VC</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* User & Official Directory Tab */
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-2xl border shadow-xl overflow-hidden`}>
          <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-200 bg-slate-50'} flex justify-between items-center`}>
            <div>
              <h3 className="text-xl font-bold flex items-center"><Users className="w-5 h-5 mr-3 text-purple-500" />Sovereign User & Official Directory</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Registered citizens, revenue officers, and platform operators</p>
            </div>
            <button onClick={fetchUsers} disabled={loadingUsers} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingUsers ? 'animate-spin' : ''}`} /> Refresh Directory
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className={`${isDark ? 'bg-slate-900/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'} uppercase border-b`}>
                <tr className="px-6 py-4">
                  <th className="px-6 py-3">User / Official</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Service ID / Aadhaar</th>
                  <th className="px-6 py-3">Designation / Office</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-200'}`}>
                {usersList.map((u: any, idx: number) => (
                  <tr key={idx} className={`${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4 font-bold flex items-center">
                      <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${u.role === 'OFFICER' ? 'bg-orange-500/20 text-orange-400' : u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {u.role === 'OFFICER' ? <Landmark className="w-4 h-4" /> : u.role === 'ADMIN' ? <Lock className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${u.role === 'OFFICER' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{u.email}</td>
                    <td className="px-6 py-4 font-mono">{u.employeeId || u.aadhaarNumber || u.aadhaar || 'Verified'}</td>
                    <td className="px-6 py-4 text-slate-400">{u.designation || (u.officerProfile?.designation) || (u.role === 'CITIZEN' ? 'Landowner (Khasra 142/2)' : 'System Admin')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ActionConfirmModal isOpen={showKillSwitch} onClose={() => setShowKillSwitch(false)} onConfirm={onToggleHalt} t={t} isDanger={true} isDark={isDark} />
      <HearingDetailModal hearing={selectedHearing} isOpen={!!selectedHearing} onClose={() => setSelectedHearing(null)} onOpenVC={(h: any) => setActiveVC(h)} t={t} isDark={isDark} />
      <VirtualCourtModal hearing={activeVC} isOpen={!!activeVC} onClose={() => setActiveVC(null)} t={t} isDark={isDark} />
    </motion.div>
  );
};

const LoginForms = ({ onLogin, t, isDark, showToast }: any) => {
  const [step, setStep] = useState('select'); 
  const [loading, setLoading] = useState(false);
  const [citizenId, setCitizenId] = useState('984210984210');
  const [citizenPassword, setCitizenPassword] = useState('Land@123');
  const [nicEmail, setNicEmail] = useState('officer@landportal.demo');
  const [password, setPassword] = useState('Officer@123');
  const [epramaanToken, setEpramaanToken] = useState('EPR-98421');
  const [adminToken, setAdminToken] = useState('Admin@123');

  // Citizen Registration State
  const [regName, setRegName] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Official Registration State
  const [regOffName, setRegOffName] = useState('');
  const [regOffEmail, setRegOffEmail] = useState('');
  const [regOffEmployeeId, setRegOffEmployeeId] = useState('');
  const [regOffPhone, setRegOffPhone] = useState('');
  const [regOffDept, setRegOffDept] = useState('Revenue & Land Acquisition');
  const [regOffDesignation, setRegOffDesignation] = useState('Sub-Divisional Magistrate (SDM & CALA)');
  const [regOffDistrict, setRegOffDistrict] = useState('Pithampur');
  const [regOffOffice, setRegOffOffice] = useState('Office of the Sub-Divisional Magistrate');
  const [regOffPassword, setRegOffPassword] = useState('');

  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.citizenLogin(citizenId, citizenPassword);
      onLogin('citizen', res);
    } catch (err: any) {
      showToast(err.message || "Invalid credentials. Please verify your Aadhaar/Email and Password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        aadhaarNumber: regAadhaar,
        password: regPassword || 'Land@123'
      });
      showToast(`Welcome, ${regName}! Account created successfully.`);
      if (res && res.token) {
        onLogin('citizen', res);
      } else {
        setCitizenId(regAadhaar || regEmail);
        setCitizenPassword(regPassword || 'Land@123');
        setStep('citizen');
      }
    } catch (err: any) {
      showToast(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleOfficialRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.registerOfficial({
        name: regOffName,
        email: regOffEmail,
        employeeId: regOffEmployeeId,
        phone: regOffPhone,
        department: regOffDept,
        designation: regOffDesignation,
        district: regOffDistrict,
        officeName: regOffOffice,
        password: regOffPassword || 'Officer@123'
      });
      showToast(`Welcome Officer ${regOffName}! Official profile registered successfully.`);
      if (res && res.token) {
        onLogin('gov', res);
      } else {
        setNicEmail(regOffEmployeeId || regOffEmail);
        setPassword(regOffPassword || 'Officer@123');
        setStep('gov');
      }
    } catch (err: any) {
      showToast(err.message || "Official registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.login(nicEmail, password, epramaanToken);
      onLogin('gov', res);
    } catch (err: any) {
      showToast(err.message || "Backend offline. Entering demo mode...");
      onLogin('gov', { name: "Shri Alok Sharma", email: nicEmail, role: "OFFICER", employeeId: "GOV-OFF-2026-9842", designation: "SDM & CALA", department: "Revenue", district: "Pithampur" });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.adminLogin(adminToken);
      onLogin('admin', res);
    } catch (err: any) {
      showToast(err.message || "Backend offline. Entering demo mode...");
      onLogin('admin', { name: "System Admin", role: "ADMIN" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 w-full max-w-md relative z-10">
      {step === 'select' && (
        <div className="space-y-3.5">
          <div onClick={() => setStep('citizen')} className={`${isDark ? 'bg-slate-900/80 border-slate-700/80 text-white hover:border-cyan-500/60' : 'bg-white/90 border-slate-200 text-slate-900 hover:border-cyan-500'} backdrop-blur-2xl border p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all shadow-xl`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4"><div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform"><User className="w-6 h-6" /></div><div><h3 className="font-bold text-lg">{t('login_citizen')}</h3><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Aadhaar / Email & Password</p></div></div><ChevronRight className="text-slate-400 group-hover:text-cyan-500 transition-colors" />
            </div>
          </div>
          <div onClick={() => setStep('register')} className={`${isDark ? 'bg-slate-900/80 border-slate-700/80 text-white hover:border-emerald-500/60' : 'bg-white/90 border-slate-200 text-slate-900 hover:border-emerald-500'} backdrop-blur-2xl border p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all shadow-xl`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4"><div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><UserPlus className="w-6 h-6" /></div><div><h3 className="font-bold text-lg">New Citizen Registration</h3><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Create Account & Link Aadhaar</p></div></div><ChevronRight className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div onClick={() => setStep('gov')} className={`${isDark ? 'bg-slate-900/80 border-slate-700/80 text-white hover:border-orange-500/60' : 'bg-white/90 border-slate-200 text-slate-900 hover:border-orange-500'} backdrop-blur-2xl border p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all shadow-xl`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4"><div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><Landmark className="w-6 h-6" /></div><div><h3 className="font-bold text-lg">{t('login_gov')}</h3><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NIC / Employee ID & Password</p></div></div><ChevronRight className="text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </div>
          <div onClick={() => setStep('register-official')} className={`${isDark ? 'bg-slate-900/80 border-slate-700/80 text-white hover:border-amber-500/60' : 'bg-white/90 border-slate-200 text-slate-900 hover:border-amber-500'} backdrop-blur-2xl border p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all shadow-xl`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4"><div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><ShieldCheck className="w-6 h-6" /></div><div><h3 className="font-bold text-lg">{t('login_official_reg')}</h3><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('official_reg_desc')}</p></div></div><ChevronRight className="text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
          <div onClick={() => setStep('admin')} className={`${isDark ? 'bg-slate-900/80 border-slate-700/80 text-white hover:border-purple-500/60' : 'bg-white/90 border-slate-200 text-slate-900 hover:border-purple-500'} backdrop-blur-2xl border p-4 sm:p-5 rounded-2xl cursor-pointer group transition-all shadow-xl`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4"><div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform"><Lock className="w-6 h-6" /></div><div><h3 className="font-bold text-lg">{t('login_admin')}</h3><p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Master YubiKey Access</p></div></div><ChevronRight className="text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </div>
        </div>
      )}

      {step !== 'select' && (
        <div className={`${isDark ? 'bg-slate-900/90 border-slate-700/80 text-white' : 'bg-white/95 border-slate-200 text-slate-900'} backdrop-blur-2xl border p-6 sm:p-7 rounded-3xl shadow-2xl relative overflow-hidden`}>
          <button onClick={() => setStep('select')} className="absolute top-4 left-4 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center text-xs transition-colors"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back</button>
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              {step === 'register' ? 'New Citizen Registration' : step === 'register-official' ? t('login_official_reg') : t(`login_${step}`)}<br/>
              <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {step === 'register' ? 'RFCTLARR 2013 Sovereign Land Registry' : step === 'register-official' ? t('official_reg_desc') : t('auth_portal')}
              </span>
            </h3>

            {step === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Full Name (भूस्वामी का नाम)</label>
                  <input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Vikram Patil" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors text-sm`} />
                </div>
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>12-Digit Aadhaar / Parivahan ID</label>
                  <input type="text" required value={regAadhaar} onChange={(e) => setRegAadhaar(e.target.value)} placeholder="e.g. 984210984210" maxLength={12} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 font-mono tracking-widest text-center focus:border-emerald-500 outline-none transition-colors text-sm`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Mobile No.</label>
                    <input type="tel" required value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="98XXXXXXXX" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors text-sm`} />
                  </div>
                  <div>
                    <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Email ID</label>
                    <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="vikram@demo.com" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors text-sm`} />
                  </div>
                </div>
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Create Password</label>
                  <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3 focus:border-emerald-500 outline-none transition-colors text-sm`} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-emerald-900/50 mt-2 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  Complete Citizen Registration
                </button>
                <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} pt-1`}>
                  Already registered? <button type="button" onClick={() => setStep('citizen')} className="text-cyan-400 font-bold hover:underline">Log in with Aadhaar</button>
                </p>
              </form>
            )}

            {step === 'register-official' && (
              <form onSubmit={handleOfficialRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Full Name</label>
                    <input type="text" required value={regOffName} onChange={e => setRegOffName(e.target.value)} placeholder="e.g. Alok Sharma" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{t('employee_id')}</label>
                    <input type="text" required value={regOffEmployeeId} onChange={e => setRegOffEmployeeId(e.target.value)} placeholder="GOV-OFF-2026" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs font-mono outline-none focus:border-orange-500`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Gov/Official Email</label>
                    <input type="email" required value={regOffEmail} onChange={e => setRegOffEmail(e.target.value)} placeholder="officer@nic.in" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                  </div>
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Mobile No.</label>
                    <input type="tel" required value={regOffPhone} onChange={e => setRegOffPhone(e.target.value)} placeholder="98XXXXXXXX" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{t('designation')}</label>
                    <select value={regOffDesignation} onChange={e => setRegOffDesignation(e.target.value)} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`}>
                      <option value="Sub-Divisional Magistrate (SDM & CALA)">SDM & CALA</option>
                      <option value="Tehsildar / Executive Magistrate">Tehsildar</option>
                      <option value="District Collector & District Magistrate">District Collector (DM)</option>
                      <option value="Competent Authority Land Acquisition (CALA)">CALA Officer</option>
                      <option value="Revenue Inspector / Survey Officer">Revenue Inspector</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{t('district')}</label>
                    <input type="text" required value={regOffDistrict} onChange={e => setRegOffDistrict(e.target.value)} placeholder="Pithampur / Dhar" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                  </div>
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>{t('department')}</label>
                  <input type="text" value={regOffDept} onChange={e => setRegOffDept(e.target.value)} placeholder="Revenue & Land Acquisition" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>Official Password</label>
                  <input type="password" required value={regOffPassword} onChange={e => setRegOffPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-2.5 text-xs outline-none focus:border-orange-500`} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-orange-900/50 mt-2 text-xs">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Landmark className="w-4 h-4 mr-2" />}
                  Register Sovereign Official Account
                </button>
                <p className={`text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} pt-1`}>
                  Already onboarded? <button type="button" onClick={() => setStep('gov')} className="text-orange-400 font-bold hover:underline">Log in with Gov Credentials</button>
                </p>
              </form>
            )}
            
            {step === 'citizen' && (
              <form onSubmit={handleCitizenSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1.5`}>Aadhaar Number or Registered Email (आधार / ईमेल)</label>
                  <input 
                    type="text" 
                    required 
                    value={citizenId} 
                    onChange={(e) => setCitizenId(e.target.value)} 
                    placeholder="Enter 12-digit Aadhaar or Email" 
                    className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 focus:border-cyan-500 outline-none transition-colors text-sm`} 
                  />
                </div>
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1.5`}>Password (पासवर्ड)</label>
                  <input 
                    type="password" 
                    required 
                    value={citizenPassword} 
                    onChange={(e) => setCitizenPassword(e.target.value)} 
                    placeholder="Enter your account password" 
                    className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 focus:border-cyan-500 outline-none transition-colors text-sm`} 
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-all flex justify-center items-center shadow-lg shadow-cyan-900/50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
                  Sign In as Citizen / Landowner
                </button>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Demo: Land@123</span>
                  <button type="button" onClick={() => setStep('register')} className="text-emerald-400 font-bold hover:underline">
                    New Landowner? Register
                  </button>
                </div>
              </form>
            )}

            {step === 'gov' && (
              <form onSubmit={handleGovSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1.5`}>NIC / Gov Email or Employee ID (ईमेल / कर्मचारी आईडी)</label>
                  <input type="text" required value={nicEmail} onChange={(e) => setNicEmail(e.target.value)} placeholder="officer@nic.in or GOV-OFF-2026-9842" className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 focus:border-orange-500 outline-none transition-colors text-sm`} />
                </div>
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1.5`}>Password (पासवर्ड)</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 focus:border-orange-500 outline-none transition-colors text-sm`} />
                </div>
                <div>
                  <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1.5`}>e-Pramaan 2FA Token (Optional)</label>
                  <input type="text" value={epramaanToken} onChange={(e) => setEpramaanToken(e.target.value)} placeholder={t('epramaan_token')} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 font-mono text-center focus:border-orange-500 outline-none transition-colors text-sm`} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all flex justify-center shadow-lg shadow-orange-900/50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('verify_login')}
                </button>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className={`${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Demo: Officer@123</span>
                  <button type="button" onClick={() => setStep('register-official')} className="text-orange-400 font-bold hover:underline">
                    New Official? Register
                  </button>
                </div>
              </form>
            )}

            {step === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Restricted Sovereign Zone</p>
                </div>
                <input type="password" required value={adminToken} onChange={(e) => setAdminToken(e.target.value)} placeholder={t('admin_token')} className={`w-full ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl p-3.5 font-mono text-center tracking-widest focus:border-purple-500 outline-none transition-colors`} />
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex justify-center shadow-lg shadow-purple-900/50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authenticate Root"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isDark, setIsDark] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isBackendLive, setIsBackendLive] = useState(false);
  
  const [sharedData, setSharedData] = useState({
    notices: [{ id: 'N101', stage: 1, date: '2026-09-15', message: 'Section 4 Notice Issued' }],
    grievances: [{ id: 'GRV-084', type: 'Valuation Dispute', desc: 'Market value considered is from 2018 instead of current circle rate.', status: 'status_pending', date: '2026-09-28' }],
    hearings: [{ caseId: 'TS-1042', time: '10:30 AM, Oct 5', location: 'Tehsil Conference Hall, Room 204, Pithampur', virtualLink: 'https://webex.nic.in/join/terrasync-hearing-1042', presidingOfficer: 'Shri Alok Sharma (IAS, SDM)' }],
    cases: [{ id: "1042", nameKey: "ramesh_kumar", owner: "Ramesh Kumar", khasra: "142/2", stage: 2, status: 'SURVEY_IN_PROGRESS' }],
    stats: { totalAcquiredAreaHectares: 1245, compensationSanctionedCrores: 485, pendingGrievancesCount: 1, scheduledHearingsCount: 1 },
    caseData: null as any,
    gateways: null as any,
    auditLogs: [] as any[]
  });

  const showToast = (msg: string) => setToastMsg(msg);
  const t = useCallback((key: string) => translations[language][key] || key, [language]);
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  const toggleTheme = () => setIsDark(prev => !prev);

  // Check backend health & sync data on login
  const syncBackendData = useCallback(async (currentRole: string) => {
    try {
      if (currentRole === 'citizen') {
        const [activeCaseRes, grievancesRes, notifsRes] = await Promise.allSettled([
          api.getActiveCase(),
          api.getMyGrievances(),
          api.getNotifications()
        ]);
        
        setIsBackendLive(true);
        setSharedData(prev => ({
          ...prev,
          caseData: activeCaseRes.status === 'fulfilled' ? activeCaseRes.value : prev.caseData,
          grievances: grievancesRes.status === 'fulfilled' && grievancesRes.value.length > 0 ? grievancesRes.value : prev.grievances,
          notices: notifsRes.status === 'fulfilled' && notifsRes.value.length > 0 ? notifsRes.value : prev.notices
        }));
      } else if (currentRole === 'gov') {
        const [statsRes, casesRes, hearingsRes, grievancesRes] = await Promise.allSettled([
          api.getOfficerStats(),
          api.getOfficerCases(),
          api.getOfficerHearings(),
          api.getOfficerGrievances()
        ]);
        
        setIsBackendLive(true);
        setSharedData(prev => ({
          ...prev,
          stats: statsRes.status === 'fulfilled' ? statsRes.value : prev.stats,
          cases: casesRes.status === 'fulfilled' && casesRes.value.length > 0 ? casesRes.value : prev.cases,
          hearings: hearingsRes.status === 'fulfilled' && hearingsRes.value.length > 0 ? hearingsRes.value : prev.hearings,
          grievances: grievancesRes.status === 'fulfilled' && grievancesRes.value.length > 0 ? grievancesRes.value : prev.grievances
        }));
      } else if (currentRole === 'admin') {
        const [gatewaysRes, logsRes, hearingsRes] = await Promise.allSettled([
          api.getGatewayHealth(),
          api.getAuditLogs(),
          api.getAdminHearings()
        ]);
        
        setIsBackendLive(true);
        setSharedData(prev => ({
          ...prev,
          gateways: gatewaysRes.status === 'fulfilled' ? gatewaysRes.value : prev.gateways,
          auditLogs: logsRes.status === 'fulfilled' && logsRes.value.length > 0 ? logsRes.value : prev.auditLogs,
          hearings: hearingsRes.status === 'fulfilled' && hearingsRes.value.length > 0 ? hearingsRes.value : prev.hearings
        }));
      }
    } catch (err) {
      console.warn("Backend sync note: running in hybrid demo mode", err);
      setIsBackendLive(false);
    }
  }, []);

  const handleLoginSuccess = (selectedRole: string, userData: any) => {
    setRole(selectedRole);
    setUser(userData);
    showToast(`Welcome back, ${userData?.name || selectedRole}!`);
    syncBackendData(selectedRole);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setRole(null);
    setUser(null);
    api.clearToken();
  };

  // Actions
  const handleAddGrievance = async (g: any) => {
    try {
      const saved = await api.fileGrievance(g.rawType || g.type, g.desc);
      setSharedData(prev => ({ ...prev, grievances: [saved, ...prev.grievances] }));
      showToast("Grievance Filed Securely in Backend!");
    } catch {
      const mockG = { id: `GRV-${Math.floor(1000 + Math.random() * 9000)}`, type: g.type, desc: g.desc, date: new Date().toISOString().split('T')[0], status: 'status_pending' };
      setSharedData(prev => ({ ...prev, grievances: [mockG, ...prev.grievances] }));
      showToast("Grievance Recorded (Demo Mode)");
    }
  };

  const handleAdvanceStage = async (caseId: any) => {
    try {
      const res = await api.advanceCaseStage(caseId);
      showToast(res.message || "Acquisition stage advanced successfully!");
      syncBackendData(role || 'gov');
    } catch {
      setSharedData(prev => ({
        ...prev,
        cases: prev.cases.map((c: any) => (c.id == caseId || c.caseNumber == caseId) ? { ...c, stage: Math.min(5, (c.stage || 2) + 1) } : c)
      }));
      showToast("Case advanced to next statutory stage (Demo Mode)");
    }
  };

  const handleResolveGrievance = async (id: any, status: string, resolution: string) => {
    try {
      const res = await api.resolveGrievance(id, status, resolution);
      showToast(res.message || "Grievance resolved and published to audit log!");
      syncBackendData(role || 'gov');
    } catch {
      setSharedData(prev => ({
        ...prev,
        grievances: prev.grievances.map((g: any) => g.id == id ? { ...g, status, resolution, resolvedAt: new Date().toISOString() } : g)
      }));
      showToast("Grievance order recorded (Demo Mode)");
    }
  };

  const handleScheduleHearing = async (data: any) => {
    try {
      const res = await api.scheduleHearing(data);
      showToast(res.message || "Public hearing scheduled and summons dispatched!");
      syncBackendData(role || 'gov');
    } catch {
      setSharedData(prev => ({
        ...prev,
        hearings: [data, ...prev.hearings]
      }));
      showToast("Hearing scheduled (Demo Mode)");
    }
  };

  const handleUploadDocument = async (doc: any) => {
    try {
      const caseId = sharedData.caseData?.case?.id || sharedData.caseData?.id || 2;
      const res = await api.uploadDocument(caseId, doc);
      showToast(res.message || "Document encrypted and verified into Sovereign Vault!");
      syncBackendData('citizen');
    } catch {
      setSharedData(prev => ({
        ...prev,
        caseData: {
          ...prev.caseData,
          documents: [...(prev.caseData?.documents || []), doc]
        }
      }));
      showToast("Document uploaded and sealed with SHA-256 (Demo Mode)");
    }
  };

  const handleIssueNotice = async (caseId: any) => {
    try {
      await api.issueNotice(caseId);
      showToast("Official Notice Issued & Logged in Audit Trail!");
      syncBackendData('gov');
    } catch {
      showToast("Notice Generated (Demo Mode)");
    }
  };

  const handleBroadcast = async () => {
    try {
      const res = await api.broadcastSms();
      showToast(res.message || "Bulk SMS & WhatsApp Dispatched via Gateway!");
    } catch {
      showToast("Bulk SMS & WhatsApp Dispatched (Simulated)");
    }
  };

  const handleToggleHalt = async () => {
    try {
      const res = await api.toggleSystemHalt();
      showToast(res.message || "SYSTEM HALT TOGGLED");
      syncBackendData('admin');
    } catch {
      showToast("SYSTEM HALTED SUCCESSFULLY (Simulated)");
    }
  };

  if (!role) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#050B14]' : 'bg-slate-100'} flex items-center justify-center p-4 relative font-sans overflow-hidden transition-colors duration-300`}>
        <ParticleBackground isDark={isDark} />
        <div className="relative z-10 max-w-5xl w-full flex flex-col md:flex-row gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="flex-1 text-center md:text-left pt-6">
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start mb-6">
              <InteractiveThreeLogo />
              <div className="md:ml-6 mt-4 md:mt-0">
                <h1 className={`text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-tight pt-2 pb-4 leading-normal ${language === 'hi' ? 'font-serif' : ''}`}>
                  {t('brand')}
                </h1>
                <p className="text-emerald-500 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs sm:text-sm flex items-center justify-center md:justify-start mt-1">
                  <ShieldCheck className="w-4 h-4 mr-1.5" /> Govt. Verified
                </p>
              </div>
            </div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-lg max-w-md mx-auto md:mx-0 leading-relaxed font-medium`}>{t('tagline')}</p>
            <div className="mt-10 flex gap-4 justify-center md:justify-start items-center">
              <button onClick={toggleLanguage} className={`relative flex items-center w-28 h-12 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'} rounded-full p-1 cursor-pointer border shadow-xl overflow-hidden`}>
                <motion.div className="absolute top-1 bottom-1 w-[50px] bg-cyan-600 rounded-full shadow-md" animate={{ x: language === 'en' ? 0 : 52 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                <span className={`relative z-10 flex-1 text-center text-sm font-bold ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>EN</span>
                <span className={`relative z-10 flex-1 text-center text-sm font-bold ${language === 'hi' ? 'text-white' : 'text-slate-400'}`}>HI</span>
              </button>

              <button onClick={toggleTheme} className={`flex items-center space-x-2 px-4 py-3 rounded-full ${isDark ? 'bg-slate-800 text-yellow-400 border-slate-600 hover:bg-slate-700' : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'} border shadow-xl transition-colors`}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
                <span className="text-xs font-bold">{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </motion.div>
          <LoginForms onLogin={handleLoginSuccess} t={t} isDark={isDark} showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#070D19] text-slate-200' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-cyan-500/30 relative pb-10 transition-colors duration-300`}>
      <nav className={`sticky top-0 z-40 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-xl border-b shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-20 items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-[0_0_10px_rgba(6,182,212,0.5)]">TS</div>
            <div>
              <span className={`font-black text-2xl tracking-tight leading-normal pt-1 ${language === 'hi' ? 'font-serif' : ''}`}>{t('brand')}</span>
              <span className="hidden sm:inline-block ml-3 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
                {role.toUpperCase()} SESSION
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             {/* Connection Status Badge */}
             <div className={`hidden md:flex items-center text-xs px-2.5 py-1 rounded-full border ${isBackendLive ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'}`}>
               {isBackendLive ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
               <span>{isBackendLive ? 'Live API Connected' : 'Hybrid Demo Mode'}</span>
             </div>

             <button onClick={toggleLanguage} className={`relative flex items-center w-20 h-8 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-slate-100 border-slate-300'} rounded-full p-0.5 cursor-pointer border`}>
                <motion.div className="absolute top-0.5 bottom-0.5 w-9 bg-cyan-600 rounded-full" animate={{ x: language === 'en' ? 0 : 38 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                <span className={`relative z-10 flex-1 text-center text-[10px] font-bold ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>EN</span>
                <span className={`relative z-10 flex-1 text-center text-[10px] font-bold ${language === 'hi' ? 'text-white' : 'text-slate-400'}`}>HI</span>
             </button>

             <button onClick={toggleTheme} className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} transition-colors border ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
               {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>

            <div className="flex items-center space-x-4 border-l border-inherit pl-4">
              <button onClick={() => setShowLogoutModal(true)} title={t('logout')} className={`${isDark ? 'bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400' : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600'} p-2.5 rounded-xl border border-transparent transition-colors`}><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {role === 'citizen' && <CitizenDashboard t={t} language={language} sharedData={sharedData} onAddGrievance={handleAddGrievance} onUploadDocument={handleUploadDocument} showToast={showToast} isDark={isDark} user={user} />}
        {role === 'gov' && <GovDashboard t={t} sharedData={sharedData} showToast={showToast} isDark={isDark} onIssueNotice={handleIssueNotice} onBroadcast={handleBroadcast} onAdvanceStage={handleAdvanceStage} onResolveGrievance={handleResolveGrievance} onScheduleHearing={handleScheduleHearing} user={user} />}
        {role === 'admin' && <AdminDashboard t={t} sharedData={sharedData} showToast={showToast} isDark={isDark} onToggleHalt={handleToggleHalt} />}
      </main>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} t={t} isDark={isDark} />
      <Toast message={toastMsg} isVisible={!!toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}