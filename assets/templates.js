(function (window) {
  'use strict';

  const CV_FORMATS = [
    {
      id: 'reverse-chronological',
      name: { es: 'Cronológico inverso', en: 'Reverse chronological' },
      short: { es: 'Muy recomendado para la mayoría de perfiles profesionales.', en: 'Highly recommended for most professional profiles.' },
      photo: 'optional',
      template: 'ats'
    },
    {
      id: 'hybrid-technical',
      name: { es: 'Mixto / híbrido técnico', en: 'Technical hybrid' },
      short: { es: 'Ideal para perfiles técnicos, ingeniería, IT, ciberseguridad y perfiles con proyectos.', en: 'Best for technical, engineering, IT, cybersecurity and project-based profiles.' },
      photo: 'not-recommended',
      template: 'hybrid'
    },
    {
      id: 'ats-simple',
      name: { es: 'ATS simple', en: 'Simple ATS' },
      short: { es: 'Formato limpio para LinkedIn Jobs, Workday, Greenhouse y filtros ATS.', en: 'Clean format for LinkedIn Jobs, Workday, Greenhouse and ATS filters.' },
      photo: 'not-recommended',
      template: 'ats'
    },
    {
      id: 'technical-projects',
      name: { es: 'CV técnico por proyectos', en: 'Technical project CV' },
      short: { es: 'Útil para software, ciberseguridad, datos, cloud, IA y portfolios.', en: 'Useful for software, cybersecurity, data, cloud, AI and portfolios.' },
      photo: 'not-recommended',
      template: 'project'
    },
    {
      id: 'uk-ireland',
      name: { es: 'CV internacional UK/Irlanda', en: 'UK/Ireland international CV' },
      short: { es: 'Sin foto, sin datos personales sensibles y con foco en logros medibles.', en: 'No photo, no sensitive personal data and focused on measurable impact.' },
      photo: 'avoid',
      template: 'uk'
    },
    {
      id: 'academic',
      name: { es: 'CV académico', en: 'Academic CV' },
      short: { es: 'Para másteres, becas, investigación, admisiones y universidad.', en: 'For master applications, scholarships, research, admissions and academia.' },
      photo: 'optional',
      template: 'academic'
    },
    {
      id: 'europass',
      name: { es: 'CV Europass', en: 'Europass CV' },
      short: { es: 'Solo recomendable cuando una convocatoria lo pida expresamente.', en: 'Recommended only when specifically requested by a call or institution.' },
      photo: 'optional',
      template: 'ats'
    },
    {
      id: 'executive',
      name: { es: 'CV ejecutivo', en: 'Executive CV' },
      short: { es: 'Para managers, dirección, consultoría senior y liderazgo.', en: 'For managers, leadership, senior consulting and executive roles.' },
      photo: 'optional',
      template: 'hybrid'
    },
    {
      id: 'functional',
      name: { es: 'Funcional por competencias', en: 'Functional skills-based CV' },
      short: { es: 'Para cambios de sector o experiencia no lineal. Usar con cuidado.', en: 'For career changes or non-linear experience. Use carefully.' },
      photo: 'optional',
      template: 'hybrid'
    },
    {
      id: 'visual-creative',
      name: { es: 'Visual / creativo', en: 'Visual / creative CV' },
      short: { es: 'Para diseño, marketing, comunicación o UX. No ideal para ATS técnico.', en: 'For design, marketing, communication or UX. Not ideal for technical ATS.' },
      photo: 'allowed',
      template: 'visual'
    }
  ];

  const TARGET_ROLES = [
    'General / Other',
    'SOC Analyst',
    'Cybersecurity Analyst',
    'Threat Analyst',
    'Incident Response Analyst',
    'Detection Engineer Junior',
    'GRC Analyst',
    'Cloud Security Junior',
    'DFIR Junior',
    'Security Engineer Junior',
    'Software Developer',
    'Data Analyst',
    'Process Engineer',
    'Project Manager'
  ];

  const ROLE_KEYWORDS = {
    'General / Other': ['stakeholder management', 'communication', 'problem solving', 'documentation', 'process improvement', 'analysis', 'reporting', 'project coordination', 'quality', 'metrics'],
    'Software Developer': ['software development', 'JavaScript', 'Python', 'Git', 'API', 'testing', 'debugging', 'frontend', 'backend', 'SQL', 'CI/CD', 'agile'],
    'Data Analyst': ['SQL', 'Python', 'Excel', 'Power BI', 'Tableau', 'data cleaning', 'dashboard', 'KPI', 'statistics', 'reporting', 'ETL'],
    'Process Engineer': ['process design', 'process simulation', 'mass balance', 'P&ID', 'HYSYS', 'Aspen', 'AutoCAD', 'optimization', 'technical documentation', 'commissioning', 'water treatment'],
    'Project Manager': ['project planning', 'risk management', 'stakeholders', 'budget', 'timeline', 'delivery', 'scrum', 'coordination', 'reporting', 'scope'],
    'SOC Analyst': ['SIEM', 'triage', 'alerts', 'incident response', 'phishing', 'malware', 'escalation', 'playbooks', 'MITRE ATT&CK', 'EDR', 'XDR', 'log analysis'],
    'Cybersecurity Analyst': ['vulnerability management', 'incident response', 'risk', 'SIEM', 'EDR', 'security monitoring', 'hardening', 'threat detection', 'log analysis', 'security controls'],
    'Threat Analyst': ['threat intelligence', 'IOCs', 'TTPs', 'MITRE ATT&CK', 'malware analysis', 'hunting', 'detection logic', 'adversary behavior', 'reporting'],
    'Incident Response Analyst': ['incident response', 'containment', 'eradication', 'recovery', 'forensics', 'malware', 'phishing', 'escalation', 'playbooks', 'root cause analysis'],
    'Detection Engineer Junior': ['Sigma', 'YARA', 'KQL', 'SPL', 'Elastic', 'detection rules', 'false positives', 'tuning', 'telemetry', 'Sysmon', 'SIEM engineering'],
    'GRC Analyst': ['ISO 27001', 'risk assessment', 'compliance', 'policies', 'audit', 'governance', 'NIST', 'controls', 'documentation', 'third-party risk'],
    'Cloud Security Junior': ['AWS', 'Azure', 'GCP', 'IAM', 'cloud security', 'logging', 'monitoring', 'Defender for Cloud', 'security groups', 'least privilege', 'CSPM'],
    'DFIR Junior': ['digital forensics', 'incident response', 'timeline analysis', 'memory forensics', 'disk forensics', 'Volatility', 'Velociraptor', 'Sysmon', 'evidence handling'],
    'Security Engineer Junior': ['firewalls', 'network security', 'hardening', 'EDR', 'SIEM', 'IAM', 'vulnerability management', 'automation', 'security architecture', 'Linux']
  };

  const COMMON_KEYWORDS = [
    'Python', 'JavaScript', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Git', 'GitHub', 'Docker', 'Linux', 'Windows', 'Azure', 'AWS', 'GCP',
    'API', 'automation', 'documentation', 'stakeholders', 'KPI', 'reporting', 'risk', 'quality', 'testing', 'monitoring', 'optimization',
    'Microsoft Sentinel', 'Splunk', 'Elastic', 'Wazuh', 'CrowdStrike', 'Microsoft Defender', 'Nessus', 'Qualys', 'Wireshark', 'Jira', 'ServiceNow'
  ];

  const DEMO_EXAMPLES = [
    {
      id: 'soc-junior',
      title: 'SOC Analyst junior',
      cv: `Julio Demo SOC\njulio.demo@example.com | +34 600 000 000 | linkedin.com/in/juliodemo | github.com/juliodemo\n\nPerfil profesional\nAnalista SOC junior con experiencia en monitorización de alertas, revisión de eventos de seguridad y documentación de procedimientos. Interés en detección de amenazas, SIEM y respuesta a incidentes.\n\nCompetencias técnicas\nMicrosoft Sentinel, Splunk, Elastic, Defender, CrowdStrike, Windows, Linux, MITRE ATT&CK, phishing analysis, log analysis, KQL, Excel.\n\nExperiencia laboral\nSOC Analyst Intern - SecureOps Demo | 2025 - Actualidad\n- Monitorización de alertas en SIEM.\n- Análisis de correos sospechosos y escalado de incidentes.\n- Documentación de playbooks y procedimientos para el equipo N1.\n- Reducción de falsos positivos mediante revisión de reglas.\n\nEducación\nGrado en Ingeniería Informática - Universidad Demo | 2021 - 2025\n\nCertificaciones\nMicrosoft SC-900 | Introduction to Cybersecurity\n\nProyectos\nControlled File Encryption Lab - Simulación segura de cifrado de archivos para evaluar telemetría endpoint.\n\nIdiomas\nEspañol nativo, inglés B2`,
      jd: `Junior SOC Analyst. We are looking for a candidate with SIEM monitoring experience, alert triage, phishing analysis, malware investigation, escalation procedures, EDR/XDR tools, incident response basics, MITRE ATT&CK knowledge, log analysis and clear documentation. Experience with Microsoft Sentinel, Splunk, Elastic, Defender or CrowdStrike is valued.`
    },
    {
      id: 'grc-junior',
      title: 'GRC junior',
      cv: `Ana Demo GRC\nana.grc@example.com | Madrid | linkedin.com/in/anagrcdemo\n\nPerfil profesional\nPerfil junior orientado a gobierno, riesgo y cumplimiento, con base técnica en ciberseguridad, documentación y mejora de procesos.\n\nCompetencias técnicas\nISO 27001, NIST CSF, Excel, Power BI, gestión documental, risk assessment, auditoría interna, políticas de seguridad.\n\nExperiencia laboral\nCybersecurity Support Intern - Consulting Demo | 2024 - 2025\n- Apoyo en revisión de controles de seguridad.\n- Preparación de documentación para auditorías internas.\n- Seguimiento de evidencias y políticas corporativas.\n\nEducación\nMáster en Ciberseguridad - Escuela Demo | 2025\nGrado en Administración y Dirección de Empresas | 2021 - 2025\n\nCertificaciones\nISO 27001 Foundation\n\nIdiomas\nEspañol nativo, inglés C1`,
      jd: `GRC Analyst Junior role focused on ISO 27001, policy management, risk assessment, compliance evidence, internal audit support, security controls, documentation, NIST framework and third-party risk. Strong written communication and Excel skills required.`
    },
    {
      id: 'threat-analyst',
      title: 'Threat Analyst',
      cv: `Mario Threat Demo\nmario.threat@example.com | linkedin.com/in/mariothreat | github.com/mariothreat\n\nProfessional profile\nCybersecurity analyst focused on threat intelligence, adversary behavior and detection use cases.\n\nTechnical skills\nMITRE ATT&CK, threat intelligence, IOCs, malware sandboxing, OSINT, Sigma, YARA, Python, MISP, Elastic, Splunk, reporting.\n\nExperience\nThreat Intelligence Trainee - Demo CERT | 2024 - 2025\n- Prepared weekly threat reports for internal teams.\n- Collected IOCs from public and private sources.\n- Mapped suspicious activity to MITRE ATT&CK techniques.\n\nProjects\nIOC Enrichment Toolkit - Python scripts for normalizing domains, hashes and IP indicators.\n\nEducation\nComputer Engineering - Demo University | 2020 - 2024\n\nLanguages\nSpanish native, English C1`,
      jd: `Threat Analyst position requiring threat intelligence, IOC analysis, TTP mapping, MITRE ATT&CK, malware analysis basics, threat hunting, detection logic, adversary behavior tracking, Python scripting and concise reporting for technical and non-technical stakeholders.`
    },
    {
      id: 'detection-engineer',
      title: 'Detection Engineer junior',
      cv: `Laura Detection Demo\nlaura.detection@example.com | linkedin.com/in/lauradetection | github.com/lauradetection\n\nPerfil profesional\nAnalista técnica junior especializada en detección, reglas Sigma, telemetría endpoint y reducción de falsos positivos.\n\nCompetencias técnicas\nSigma, KQL, SPL, Elastic, Sysmon, Windows Event Logs, Velociraptor, Python, GitHub, SIEM engineering, MITRE ATT&CK.\n\nExperiencia laboral\nSecurity Lab Assistant - University Demo | 2024 - 2025\n- Creación de reglas de detección para eventos Windows.\n- Validación de telemetría de Sysmon en laboratorio.\n- Ajuste de reglas para reducir alertas irrelevantes.\n\nProyectos\nDetection Rules Lab - Repositorio con reglas Sigma y consultas KQL para técnicas MITRE simuladas.\n\nEducación\nGrado en Ingeniería de Telecomunicaciones | 2021 - 2025\n\nIdiomas\nEspañol nativo, inglés B2`,
      jd: `Junior Detection Engineer. Required knowledge: Sigma, YARA, KQL, SPL, Elastic, detection rules, false positive tuning, Windows telemetry, Sysmon, SIEM engineering, MITRE ATT&CK and documentation of detection logic.`
    },
    {
      id: 'cloud-security',
      title: 'Cloud Security junior',
      cv: `Carlos Cloud Demo\ncarlos.cloud@example.com | linkedin.com/in/carloscloud | github.com/carloscloud\n\nProfessional profile\nJunior cloud and cybersecurity profile with hands-on labs in Azure, IAM and security monitoring.\n\nTechnical skills\nAzure, AWS basics, IAM, Microsoft Defender for Cloud, logging, monitoring, security groups, least privilege, Terraform basics, Linux, Python.\n\nExperience\nIT Security Intern - Cloud Demo | 2024 - 2025\n- Reviewed access permissions and basic IAM configurations.\n- Supported monitoring of cloud logs and security recommendations.\n- Documented hardening actions for virtual machines.\n\nProjects\nAzure Security Baseline Lab - Deployment of a small cloud environment with logging and least privilege practices.\n\nEducation\nHigher Technical Degree in Network Systems Administration | 2022 - 2024\n\nCertifications\nMicrosoft SC-900, AZ-900\n\nLanguages\nSpanish native, English B2`,
      jd: `Cloud Security Junior role. The candidate should understand Azure or AWS, IAM, cloud logging, monitoring, least privilege, security groups, Defender for Cloud, CSPM basics, scripting, documentation and security baseline implementation.`
    }
  ];

  window.CVOTemplates = {
    CV_FORMATS,
    TARGET_ROLES,
    ROLE_KEYWORDS,
    COMMON_KEYWORDS,
    DEMO_EXAMPLES
  };
})(window);
