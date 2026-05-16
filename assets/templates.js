(function (window) {
  'use strict';

  const CV_FORMATS = [
    { id: 'reverse-chronological', name: { es: 'Cronológico inverso', en: 'Reverse chronological' }, short: { es: 'Ordena la experiencia de más reciente a más antigua. Muy sólido para perfiles con trayectoria clara.', en: 'Lists experience from newest to oldest. Strong default for linear careers.' }, template: 'reverse' },
    { id: 'hybrid', name: { es: 'Mixto / híbrido', en: 'Hybrid' }, short: { es: 'Combina perfil, competencias y experiencia. Suele ser el mejor equilibrio para perfiles técnicos y junior+.', en: 'Combines summary, skills and experience. Often the best balance for technical and junior+ profiles.' }, template: 'hybrid' },
    { id: 'ats-simple', name: { es: 'ATS simple', en: 'Simple ATS' }, short: { es: 'Formato limpio, sin columnas complejas ni gráficos. Prioritario para portales de empleo.', en: 'Clean layout without complex columns or graphics. Strong for job portals.' }, template: 'ats' },
    { id: 'technical-projects', name: { es: 'Técnico por proyectos', en: 'Technical projects' }, short: { es: 'Da peso a proyectos, herramientas y resultados técnicos. Útil en IT, ingeniería, datos y portfolios.', en: 'Highlights projects, tools and technical output. Useful for IT, engineering, data and portfolios.' }, template: 'projects' },
    { id: 'uk-ireland', name: { es: 'Internacional UK/Irlanda', en: 'UK/Ireland international' }, short: { es: 'Sin foto ni datos personales sensibles. Enfoque en impacto, herramientas y logros medibles.', en: 'No photo or sensitive personal data. Focuses on impact, tools and measurable achievements.' }, template: 'uk' },
    { id: 'academic', name: { es: 'Académico', en: 'Academic' }, short: { es: 'Adecuado para becas, másteres, investigación, publicaciones y entorno universitario.', en: 'For scholarships, master applications, research, publications and academia.' }, template: 'academic' },
    { id: 'europass', name: { es: 'Europass', en: 'Europass' }, short: { es: 'Úsalo solo si la convocatoria lo solicita expresamente o en procesos europeos formales.', en: 'Use only when explicitly requested or for formal EU procedures.' }, template: 'europass' },
    { id: 'executive', name: { es: 'Ejecutivo', en: 'Executive' }, short: { es: 'Para perfiles senior, dirección, liderazgo, negocio y gestión de equipos.', en: 'For senior, leadership, business and team management profiles.' }, template: 'executive' },
    { id: 'functional', name: { es: 'Funcional por competencias', en: 'Functional skills-based' }, short: { es: 'Puede ayudar en cambios de sector, pero es menos transparente para ATS y recruiters.', en: 'Can help career changes, but is less transparent for ATS and recruiters.' }, template: 'functional' },
    { id: 'visual-creative', name: { es: 'Visual / creativo', en: 'Visual / creative' }, short: { es: 'Solo recomendable para marketing, comunicación, diseño, UX o candidaturas creativas.', en: 'Best reserved for marketing, communication, design, UX or creative applications.' }, template: 'visual' }
  ];

  const SECTORS = [
    { id: 'technology', es: 'Tecnología / IT', en: 'Technology / IT' },
    { id: 'cybersecurity', es: 'Ciberseguridad', en: 'Cybersecurity' },
    { id: 'data-ai', es: 'Data / IA', en: 'Data / AI' },
    { id: 'engineering', es: 'Ingeniería', en: 'Engineering' },
    { id: 'business-finance', es: 'Empresa / ADE / Finanzas', en: 'Business / Finance' },
    { id: 'marketing-comms', es: 'Marketing / Comunicación', en: 'Marketing / Communication' },
    { id: 'legal-compliance', es: 'Legal / Compliance', en: 'Legal / Compliance' },
    { id: 'education-research', es: 'Educación / Investigación', en: 'Education / Research' },
    { id: 'health', es: 'Salud', en: 'Health' },
    { id: 'other', es: 'Otro', en: 'Other' }
  ];

  const LEVELS = [
    { id: 'internship', es: 'Prácticas / Internship', en: 'Internship' },
    { id: 'junior', es: 'Junior', en: 'Junior' },
    { id: 'juniorPlus', es: 'Junior+', en: 'Junior+' },
    { id: 'mid', es: 'Mid', en: 'Mid' },
    { id: 'senior', es: 'Senior', en: 'Senior' },
    { id: 'lead', es: 'Lead / Manager', en: 'Lead / Manager' },
    { id: 'executive', es: 'Executive', en: 'Executive' }
  ];

  const TARGET_COUNTRIES = [
    { id: 'ES', es: 'España', en: 'Spain' },
    { id: 'IE', es: 'Irlanda', en: 'Ireland' },
    { id: 'GB', es: 'Reino Unido', en: 'United Kingdom' },
    { id: 'DE', es: 'Alemania', en: 'Germany' },
    { id: 'FR', es: 'Francia', en: 'France' },
    { id: 'NL', es: 'Países Bajos', en: 'Netherlands' },
    { id: 'US', es: 'Estados Unidos', en: 'United States' },
    { id: 'CA', es: 'Canadá', en: 'Canada' },
    { id: 'MX', es: 'México', en: 'Mexico' },
    { id: 'CL', es: 'Chile', en: 'Chile' },
    { id: 'AR', es: 'Argentina', en: 'Argentina' },
    { id: 'CO', es: 'Colombia', en: 'Colombia' },
    { id: 'OTHER', es: 'Otro', en: 'Other' }
  ];

  const COMMON_KEYWORDS = [
    'Excel', 'SQL', 'Python', 'Power BI', 'Tableau', 'JavaScript', 'Git', 'GitHub', 'Docker', 'Linux', 'Windows', 'Azure', 'AWS', 'API', 'automation', 'reporting', 'documentation', 'stakeholders', 'KPI', 'risk', 'compliance', 'quality', 'testing', 'process improvement', 'project management', 'data analysis', 'communication', 'problem solving', 'monitoring', 'optimization'
  ];

  const SECTOR_KEYWORDS = {
    technology: ['software', 'API', 'Git', 'testing', 'deployment', 'cloud', 'frontend', 'backend', 'agile'],
    cybersecurity: ['SIEM', 'EDR', 'incident response', 'MITRE ATT&CK', 'phishing', 'malware', 'risk', 'SOC', 'hardening'],
    'data-ai': ['SQL', 'Python', 'dashboard', 'statistics', 'Power BI', 'ETL', 'machine learning', 'data cleaning'],
    engineering: ['process design', 'mass balance', 'P&ID', 'simulation', 'commissioning', 'AutoCAD', 'optimization', 'technical documentation'],
    'business-finance': ['financial analysis', 'Excel', 'budget', 'forecasting', 'operations', 'stakeholders', 'KPI'],
    'marketing-comms': ['content', 'campaigns', 'SEO', 'analytics', 'brand', 'copywriting', 'social media', 'communication'],
    'legal-compliance': ['compliance', 'policy', 'audit', 'risk assessment', 'regulation', 'legal research', 'governance'],
    'education-research': ['research', 'teaching', 'publication', 'methodology', 'academic writing', 'data collection'],
    health: ['patient', 'clinical', 'healthcare', 'protocol', 'quality', 'documentation'],
    other: ['communication', 'analysis', 'documentation', 'coordination', 'problem solving']
  };

  const DEMO_EXAMPLES = [
    {
      id: 'soc-junior',
      title: 'Analista SOC junior',
      sector: 'cybersecurity', country: 'IE', level: 'junior', salaryRole: 'soc', salaryLow: 38000, salaryHigh: 45000, currency: 'EUR',
      cv: `Julio Demo SOC\njulio.demo@example.com | +34 600 000 000 | linkedin.com/in/juliodemo | github.com/juliodemo\n\nPerfil profesional\nAnalista SOC junior con experiencia en monitorización de alertas, revisión de eventos de seguridad y documentación de procedimientos. Interés en detección de amenazas, SIEM y respuesta a incidentes.\n\nCompetencias técnicas\nMicrosoft Sentinel, Splunk, Elastic, Defender, CrowdStrike, Windows, Linux, MITRE ATT&CK, phishing analysis, log analysis, KQL, Excel.\n\nExperiencia profesional\nSOC Analyst Intern - SecureOps Demo | 02/2025 - Actualidad\n- Monitorización de 60 alertas diarias en SIEM.\n- Análisis de correos sospechosos y escalado de incidentes.\n- Documentación de playbooks y procedimientos para el equipo N1.\n- Reducción de falsos positivos mediante revisión de reglas.\n\nEducación\nGrado en Ingeniería Informática - Universidad Demo | 2021 - 2025\n\nCertificaciones\nMicrosoft SC-900 | Introduction to Cybersecurity\n\nProyectos\nControlled File Encryption Lab - Simulación segura de cifrado de archivos para evaluar telemetría endpoint.\n\nIdiomas\nEspañol nativo, inglés B2`,
      jd: `Junior SOC Analyst. We are looking for SIEM monitoring, alert triage, phishing analysis, escalation procedures, EDR/XDR tools, incident response basics, MITRE ATT&CK, log analysis and clear documentation. Microsoft Sentinel, Splunk, Elastic, Defender or CrowdStrike are valued.`
    },
    {
      id: 'process-engineer',
      title: 'Ingeniero de procesos junior',
      sector: 'engineering', country: 'ES', level: 'junior', salaryRole: 'engineering', salaryLow: 24000, salaryHigh: 32000, currency: 'EUR',
      cv: `Carlos Demo Procesos\ncarlos.procesos@example.com | Sevilla | linkedin.com/in/carlosprocesos\n\nPerfil profesional\nIngeniero de procesos junior orientado a desalación, balances de masa, documentación técnica y optimización de cálculos repetitivos.\n\nCompetencias\nExcel avanzado, balances de masa, PFD, P&ID, AutoCAD, HYSYS básico, tratamiento de aguas, análisis de datos, documentación técnica.\n\nExperiencia profesional\nProcess Engineering Intern - WaterTech Demo | 09/2024 - 02/2025\n- Preparación de hojas de cálculo para estimaciones de presión y caudal.\n- Apoyo en revisión de documentación técnica de plantas de desalación.\n- Comparación de escenarios con diferentes temperaturas y salinidades.\n\nEducación\nGrado en Ingeniería Industrial - Universidad Demo | 2020 - 2025\n\nProyectos\nModelo preliminar de optimización de consumos en sistemas de ósmosis inversa.\n\nIdiomas\nEspañol nativo, inglés B2`,
      jd: `Junior Process Engineer for water treatment projects. Requirements: mass balances, Excel, process documentation, PFD/P&ID interpretation, desalination or reverse osmosis knowledge, data analysis, technical reporting and communication with multidisciplinary teams.`
    },
    {
      id: 'data-analyst',
      title: 'Data analyst junior',
      sector: 'data-ai', country: 'GB', level: 'junior', salaryRole: 'data', salaryLow: 28000, salaryHigh: 36000, currency: 'GBP',
      cv: `Marta Demo Data\nmarta.data@example.com | linkedin.com/in/martadata | github.com/martadata\n\nProfessional summary\nJunior data analyst with hands-on experience in SQL, Python, Excel and Power BI dashboards. Interested in business reporting and data quality.\n\nSkills\nSQL, Python, pandas, Excel, Power BI, Tableau basics, data cleaning, dashboard design, KPI reporting, statistics.\n\nWork experience\nData Analyst Intern - Retail Analytics Demo | 2024 - 2025\n- Built weekly sales dashboards for internal stakeholders.\n- Cleaned customer datasets using SQL and Python.\n- Documented recurring data quality issues and proposed validation checks.\n\nEducation\nBSc in Business Analytics - Demo University | 2021 - 2025\n\nProjects\nSales Dashboard Portfolio - Power BI dashboard with KPI segmentation and monthly trend analysis.\n\nLanguages\nSpanish native, English C1`,
      jd: `Junior Data Analyst role requiring SQL, Python or R, Excel, Power BI dashboards, data cleaning, KPI reporting, stakeholder communication, documentation and basic statistics. Experience with retail or business analytics is a plus.`
    },
    {
      id: 'marketing-comms',
      title: 'Marketing / comunicación junior',
      sector: 'marketing-comms', country: 'ES', level: 'junior', salaryRole: 'business', salaryLow: 20000, salaryHigh: 27000, currency: 'EUR',
      cv: `Lucía Demo Comunicación\nlucia.comms@example.com | linkedin.com/in/luciacomms | portfolio-demo.com\n\nPerfil profesional\nPerfil junior de marketing y comunicación con experiencia en contenidos, redes sociales, campañas y análisis básico de métricas.\n\nCompetencias\nCopywriting, SEO básico, Google Analytics, Canva, Meta Business Suite, LinkedIn, planificación editorial, comunicación corporativa.\n\nExperiencia profesional\nMarketing Assistant Intern - Brand Demo | 2024 - 2025\n- Redacción de contenidos para blog, LinkedIn e Instagram.\n- Apoyo en campañas de captación y análisis de métricas semanales.\n- Coordinación de materiales con diseño y ventas.\n\nEducación\nGrado en Marketing y Comunicación - Universidad Demo | 2021 - 2025\n\nProyectos\nCampaña universitaria de lanzamiento con calendario editorial y medición de engagement.\n\nIdiomas\nEspañol nativo, inglés B2`,
      jd: `Junior Marketing and Communications Specialist. We need content writing, social media planning, SEO basics, campaign support, analytics, brand communication, Canva, LinkedIn and clear reporting skills.`
    },
    {
      id: 'project-manager',
      title: 'Project manager junior / consultoría',
      sector: 'business-finance', country: 'NL', level: 'juniorPlus', salaryRole: 'project', salaryLow: 42000, salaryHigh: 52000, currency: 'EUR',
      cv: `Álvaro Demo Consultoría\nalvaro.pm@example.com | linkedin.com/in/alvaropm\n\nPerfil profesional\nPerfil junior+ de gestión de proyectos y consultoría con base en análisis de negocio, coordinación de equipos y seguimiento de entregables.\n\nCompetencias\nProject planning, Excel, PowerPoint, Jira, stakeholder management, risk tracking, reporting, business analysis, process improvement.\n\nExperiencia profesional\nJunior Consultant - Strategy Demo | 2023 - 2025\n- Seguimiento de planes de trabajo y coordinación de entregables con 4 áreas.\n- Preparación de reportes ejecutivos semanales para clientes.\n- Identificación de riesgos y dependencias en proyectos de transformación.\n\nEducación\nGrado en ADE - Universidad Demo | 2019 - 2023\n\nCertificaciones\nScrum Fundamentals Certified\n\nIdiomas\nEspañol nativo, inglés C1`,
      jd: `Junior Project Manager / Consultant. Requirements: project planning, stakeholder management, risk tracking, reporting, Jira or similar tools, business analysis, process improvement, PowerPoint and strong written communication.`
    }
  ];

  window.CVOTemplates = {
    CV_FORMATS,
    SECTORS,
    LEVELS,
    TARGET_COUNTRIES,
    COMMON_KEYWORDS,
    SECTOR_KEYWORDS,
    DEMO_EXAMPLES
  };
})(window);
