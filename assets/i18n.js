(function (window) {
  'use strict';

  const dictionary = {
    es: {
      appTitle: 'CV/LinkedIn Cybersecurity Optimizer',
      appSubtitle: 'Analiza tu CV, compara una oferta, mejora bullets y exporta un CV profesional en PDF o DOCX.',
      privacyTitle: 'Privacidad',
      privacyText: 'Los archivos se procesan localmente en tu navegador. En GitHub Pages no hay backend. Si activas IA externa con tu propia API key, el texto se enviará al proveedor configurado y la clave no se guarda.',
      step1: '1. CV', step2: '2. Oferta', step3: '3. Rol', step4: '4. Análisis', step5: '5. Formato', step6: '6. Edición', step7: '7. Exportar', step8: '8. Sueldo',
      uploadCvTitle: '1. Subir o pegar CV', loadExample: 'Cargar ejemplo', cvFileLabel: 'Archivo CV (PDF, DOCX, TXT, MD, JSON)', manualCvLabel: 'Contenido del CV', parseCv: 'Interpretar CV', clearAll: 'Limpiar',
      jdTitle: '2. Oferta de trabajo', jdFileLabel: 'Subir oferta (.txt)', jdPasteLabel: 'Pegar job description', sampleJd: 'Usar oferta demo',
      profileTargetTitle: '3. Rol, destino, idioma y foto', destinationLabel: 'Destino', outputLanguageLabel: 'Idioma del CV final', customRoleLabel: 'Rol objetivo libre', rolesLegend: 'Roles objetivo', photoLabel: 'Foto de perfil opcional', includePhoto: 'Incluir foto en el CV generado',
      structuredPreviewTitle: '4. Vista estructurada editable', saveFields: 'Aplicar cambios',
      analysisTitle: '5. Análisis ATS y recomendaciones', analyzeBtn: 'Analizar compatibilidad', recommendFormat: 'Recomendar formato', analysisPlaceholder: 'Aún no hay análisis. Interpreta el CV y pulsa analizar.',
      formatTitle: '6. Formato y generación del CV final', formatSelectLabel: 'Tipo de formato', aiKeyLabel: 'API key opcional para IA externa', aiEndpointLabel: 'Endpoint IA opcional', generateCv: 'Generar CV editable', buildAiPrompt: 'Generar prompt IA', aiEnhance: 'Mejorar con IA externa',
      finalCvTitle: '7. CV final editable', exportPdf: 'Exportar PDF', exportDocx: 'Exportar DOCX', linkedinTitle: 'LinkedIn Optimizer', linkedinPlaceholder: 'Las sugerencias aparecerán tras analizar el CV.', footerText: 'Proyecto estático para portfolio, ATS y empleabilidad.',

      salaryTitle: 'Calculadora salarial global', salaryIntro: 'Estimación orientativa en dos niveles: mercado base para países soportados y modo asistido con rango local para cualquier país.', salaryFromCv: 'Detectar desde CV', calculateSalary: 'Calcular rango',
      salaryLevel1Title: 'Nivel 1', salaryLevel1Text: ' Usa rangos base internos para mercados principales.', salaryLevel2Title: 'Nivel 2', salaryLevel2Text: ' Para cualquier país: introduce un rango visto en ofertas locales y la app lo ajusta según tu CV.',
      salaryCountryLabel: 'País objetivo', salaryCurrencyLabel: 'Moneda', salaryPeriodLabel: 'Periodo', salaryAnnual: 'Bruto anual', salaryMonthly: 'Bruto mensual', salaryModeLabel: 'Modo de cálculo', salaryModeBaseline: 'Automático con mercado base', salaryModeAssisted: 'Asistido con rango local',
      salaryRoleLabel: 'Familia de rol', salarySeniorityLabel: 'Seniority', salaryExperienceLabel: 'Experiencia', salaryStrategyLabel: 'Estrategia', salaryConservative: 'Conservadora', salaryRealistic: 'Realista', salaryAmbitious: 'Ambiciosa',
      salarySectorLabel: 'Sector', sectorGeneral: 'General', sectorConsulting: 'Consultoría', sectorMssp: 'MSSP / SOC externo', sectorTech: 'Tecnología / producto', sectorFinance: 'Banca / finanzas', sectorIndustrial: 'Industrial / ingeniería', sectorPublic: 'Sector público', sectorStartup: 'Startup', sectorAcademia: 'Universidad / investigación',
      salaryWorkModeLabel: 'Modalidad', workOnsite: 'Presencial', workHybrid: 'Híbrido', workRemote: 'Remoto nacional', workInternationalRemote: 'Remoto internacional', salaryCompanyLabel: 'Tipo de empresa', companyLocal: 'Local / pequeña', companyNational: 'Nacional / media', companyMultinational: 'Multinacional', companyBigTech: 'Big Tech / alto crecimiento', companyPublic: 'Pública / regulada',
      salaryConfidenceLabel: 'Confianza', salaryConfidenceAuto: 'Automática según datos disponibles', salaryReferenceLowLabel: 'Rango local visto - mínimo', salaryReferenceHighLabel: 'Rango local visto - máximo', salaryManualHint: 'Para países no soportados o mercados muy concretos, usa el modo asistido e introduce un rango real visto en ofertas locales.', salaryPlaceholder: 'Calcula un rango para ver mínimo, contexto y objetivo recomendado.',
      salaryCalculated: 'Rango salarial calculado.', salaryNeedsReference: 'Este país o modo necesita un rango local de referencia. Introduce mínimo y máximo vistos en ofertas reales.', salaryLowBand: 'Rojo · mínimo', salaryContextBand: 'Naranja · contexto', salaryTargetBand: 'Verde · recomendado', salaryLowBandText: 'Por debajo de mercado o solo aceptable si aporta aprendizaje, visado, marca o transición estratégica.', salaryContextBandText: 'Rango razonable según contexto, modalidad, empresa y encaje con la oferta.', salaryTargetBandText: 'Objetivo recomendado de negociación si el CV, la entrevista y el mercado acompañan.', salaryProfileDetected: 'Perfil detectado', salaryMethod: 'Método', salarySourceBaseline: 'mercado base interno', salarySourceAssisted: 'rango local asistido', salaryDisclaimerTitle: 'Lectura profesional', salaryDisclaimer: 'No es una fuente salarial oficial. Es un estimador local y heurístico para preparar negociación. Valida siempre con ofertas reales, recruiters y guías salariales locales.',
      salaryWarningUnsupported: 'País sin mercado base interno: usa el modo asistido con ofertas locales.', salaryWarningBaseline: 'Los rangos base son orientativos y deben actualizarse con fuentes del mercado.', salaryWarningAssisted: 'El resultado depende de la calidad del rango local introducido.', salaryWarningMissingRole: 'Selecciona rol objetivo o completa el campo de rol libre para mejorar la estimación.', salaryWarningWeakCv: 'El CV tiene margen de mejora; el rango recomendado puede ser agresivo hasta reforzar logros y keywords.', salaryWarningCustomCountry: 'País personalizado: no hay base local interna.',
      parsedOk: 'CV interpretado. Revisa los campos estructurados antes de generar el CV final.',
      parseError: 'El archivo no se ha podido interpretar correctamente. Puedes pegar el contenido manualmente.',
      emptyCv: 'Pega o sube un CV antes de continuar.',
      analysisDone: 'Análisis completado.',
      cvGenerated: 'CV generado. Puedes editar el resultado antes de exportar.',
      noFinalCv: 'Genera primero el CV final.',
      demoLoaded: 'Ejemplo cargado:',
      fieldsSaved: 'Campos aplicados correctamente.',
      photoNotRecommended: 'Para este formato no se recomienda incluir foto. Puedes incluirla igualmente si quieres.',
      photoAvoid: 'Para UK/Irlanda o ATS internacional se recomienda no incluir foto.',
      photoOptional: 'La foto es opcional. En perfiles técnicos internacionales suele ser mejor no incluirla.',
      aiPromptReady: 'Prompt generado. Puedes copiarlo en un asistente externo.',
      aiNeedsKey: 'Introduce una API key temporal y un endpoint compatible, o usa el modo heurístico.',
      aiFailed: 'La llamada a IA externa no se ha completado. Se mantiene el modo heurístico local.',
      exportReady: 'Archivo exportado.',
      found: 'Encontradas',
      missing: 'Faltantes',
      incomplete: 'Secciones incompletas',
      risks: 'Riesgos',
      recommendations: 'Recomendaciones',
      bulletImprovements: 'Bullets mejorados',
      formatRecommendation: 'Formato recomendado',
      score: 'Score global',
      sections: 'Secciones',
      metrics: 'Métricas',
      links: 'Enlaces',
      aiMode: 'Modo de mejora',
      localMode: 'Heurístico local',
      externalMode: 'IA externa opcional'
    },
    en: {
      appTitle: 'CV/LinkedIn Cybersecurity Optimizer',
      appSubtitle: 'Analyze your CV, compare a job description, improve bullets and export a professional PDF or DOCX CV.',
      privacyTitle: 'Privacy',
      privacyText: 'Files are processed locally in your browser. GitHub Pages has no backend. If you enable external AI with your own API key, the text is sent to the configured provider and the key is not stored.',
      step1: '1. CV', step2: '2. Job', step3: '3. Role', step4: '4. Analysis', step5: '5. Format', step6: '6. Edit', step7: '7. Export', step8: '8. Salary',
      uploadCvTitle: '1. Upload or paste CV', loadExample: 'Load example', cvFileLabel: 'CV file (PDF, DOCX, TXT, MD, JSON)', manualCvLabel: 'CV content', parseCv: 'Parse CV', clearAll: 'Clear',
      jdTitle: '2. Job description', jdFileLabel: 'Upload job description (.txt)', jdPasteLabel: 'Paste job description', sampleJd: 'Use demo job',
      profileTargetTitle: '3. Role, destination, language and photo', destinationLabel: 'Destination', outputLanguageLabel: 'Final CV language', customRoleLabel: 'Free target role', rolesLegend: 'Target roles', photoLabel: 'Optional profile photo', includePhoto: 'Include photo in generated CV',
      structuredPreviewTitle: '4. Editable structured preview', saveFields: 'Apply changes',
      analysisTitle: '5. ATS analysis and recommendations', analyzeBtn: 'Analyze compatibility', recommendFormat: 'Recommend format', analysisPlaceholder: 'No analysis yet. Parse the CV and click analyze.',
      formatTitle: '6. Format and final CV generation', formatSelectLabel: 'CV format type', aiKeyLabel: 'Optional external AI API key', aiEndpointLabel: 'Optional AI endpoint', generateCv: 'Generate editable CV', buildAiPrompt: 'Generate AI prompt', aiEnhance: 'Improve with external AI',
      finalCvTitle: '7. Editable final CV', exportPdf: 'Export PDF', exportDocx: 'Export DOCX', linkedinTitle: 'LinkedIn Optimizer', linkedinPlaceholder: 'Suggestions will appear after analyzing the CV.', footerText: 'Static project for portfolio, ATS and employability.',

      salaryTitle: 'Global salary range estimator', salaryIntro: 'Indicative two-level estimation: baseline market for supported countries and assisted local range for any country.', salaryFromCv: 'Detect from CV', calculateSalary: 'Calculate range',
      salaryLevel1Title: 'Level 1', salaryLevel1Text: ' Uses internal baseline ranges for major markets.', salaryLevel2Title: 'Level 2', salaryLevel2Text: ' For any country: enter a range from local job ads and the app adjusts it using your CV.',
      salaryCountryLabel: 'Target country', salaryCurrencyLabel: 'Currency', salaryPeriodLabel: 'Period', salaryAnnual: 'Annual gross', salaryMonthly: 'Monthly gross', salaryModeLabel: 'Calculation mode', salaryModeBaseline: 'Automatic with baseline market', salaryModeAssisted: 'Assisted with local range',
      salaryRoleLabel: 'Role family', salarySeniorityLabel: 'Seniority', salaryExperienceLabel: 'Experience', salaryStrategyLabel: 'Strategy', salaryConservative: 'Conservative', salaryRealistic: 'Realistic', salaryAmbitious: 'Ambitious',
      salarySectorLabel: 'Sector', sectorGeneral: 'General', sectorConsulting: 'Consulting', sectorMssp: 'MSSP / outsourced SOC', sectorTech: 'Technology / product', sectorFinance: 'Banking / finance', sectorIndustrial: 'Industrial / engineering', sectorPublic: 'Public sector', sectorStartup: 'Startup', sectorAcademia: 'University / research',
      salaryWorkModeLabel: 'Work mode', workOnsite: 'On-site', workHybrid: 'Hybrid', workRemote: 'National remote', workInternationalRemote: 'International remote', salaryCompanyLabel: 'Company type', companyLocal: 'Local / small', companyNational: 'National / medium', companyMultinational: 'Multinational', companyBigTech: 'Big Tech / high-growth', companyPublic: 'Public / regulated',
      salaryConfidenceLabel: 'Confidence', salaryConfidenceAuto: 'Automatic from available data', salaryReferenceLowLabel: 'Observed local range - minimum', salaryReferenceHighLabel: 'Observed local range - maximum', salaryManualHint: 'For unsupported countries or very specific markets, use assisted mode and enter a real range observed in local job ads.', salaryPlaceholder: 'Calculate a range to see minimum, context and recommended target.',
      salaryCalculated: 'Salary range calculated.', salaryNeedsReference: 'This country or mode needs a local reference range. Enter minimum and maximum values observed in real job ads.', salaryLowBand: 'Red · minimum', salaryContextBand: 'Orange · context', salaryTargetBand: 'Green · recommended', salaryLowBandText: 'Below market or acceptable only for learning, visa, brand or strategic transition.', salaryContextBandText: 'Reasonable range depending on context, work mode, company and fit with the role.', salaryTargetBandText: 'Recommended negotiation target if the CV, interview and market support it.', salaryProfileDetected: 'Detected profile', salaryMethod: 'Method', salarySourceBaseline: 'internal baseline market', salarySourceAssisted: 'assisted local range', salaryDisclaimerTitle: 'Professional reading', salaryDisclaimer: 'This is not an official salary source. It is a local heuristic estimator for negotiation preparation. Always validate with real job ads, recruiters and local salary guides.',
      salaryWarningUnsupported: 'Country without internal baseline: use assisted mode with local job ads.', salaryWarningBaseline: 'Baseline ranges are indicative and should be updated with market sources.', salaryWarningAssisted: 'The result depends on the quality of the local range you entered.', salaryWarningMissingRole: 'Select a target role or complete the free role field to improve the estimate.', salaryWarningWeakCv: 'The CV still needs improvement; the recommended range may be aggressive until achievements and keywords are stronger.', salaryWarningCustomCountry: 'Custom country: no internal local baseline is available.',
      parsedOk: 'CV parsed. Review structured fields before generating the final CV.',
      parseError: 'The file could not be interpreted correctly. You can paste the content manually.',
      emptyCv: 'Paste or upload a CV before continuing.',
      analysisDone: 'Analysis completed.',
      cvGenerated: 'CV generated. You can edit it before exporting.',
      noFinalCv: 'Generate the final CV first.',
      demoLoaded: 'Example loaded:',
      fieldsSaved: 'Fields applied successfully.',
      photoNotRecommended: 'This format does not recommend adding a photo. You can still include it if you want.',
      photoAvoid: 'For UK/Ireland or international ATS, avoid including a photo.',
      photoOptional: 'Photo is optional. For international technical roles, no photo is usually better.',
      aiPromptReady: 'Prompt generated. You can copy it into an external assistant.',
      aiNeedsKey: 'Enter a temporary API key and compatible endpoint, or use the local heuristic mode.',
      aiFailed: 'The external AI call did not complete. Local heuristic mode remains active.',
      exportReady: 'File exported.',
      found: 'Found',
      missing: 'Missing',
      incomplete: 'Incomplete sections',
      risks: 'Risks',
      recommendations: 'Recommendations',
      bulletImprovements: 'Improved bullets',
      formatRecommendation: 'Recommended format',
      score: 'Global score',
      sections: 'Sections',
      metrics: 'Metrics',
      links: 'Links',
      aiMode: 'Improvement mode',
      localMode: 'Local heuristic',
      externalMode: 'Optional external AI'
    }
  };

  let current = 'es';

  function t(key) {
    return (dictionary[current] && dictionary[current][key]) || dictionary.es[key] || key;
  }

  function setLanguage(lang) {
    current = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = current;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (dictionary[current][key]) node.textContent = dictionary[current][key];
    });
    document.getElementById('lang-en')?.classList.toggle('active', current === 'en');
    document.getElementById('lang-es')?.classList.toggle('active', current === 'es');
  }

  function getLanguage() {
    return current;
  }

  window.CVOi18n = { t, setLanguage, getLanguage, dictionary };
})(window);
