import { Languages } from 'lucide-react';

interface TranslationPanelProps {
  language: string;
  explanation: any;
}

// Mock translations - in real app, would use translation API
const translations: Record<string, any> = {
  chinese: {
    summary: "您的全血细胞计数（CBC）检验结果显示了血细胞的多项测量值。其中一些结果超出了正常范围，应该与您的医生讨论，特别是您的血红蛋白水平低于正常值。",
    comprehensiveSummary: {
      title: "综合摘要",
      subtitle: "您的医疗结果一览",
      patient: "患者",
      testDate: "检查日期",
      reportType: "报告类型",
      reportTypeValue: "全血细胞计数（CBC）",
      resultsOverview: "结果概述",
      normal: "正常",
      outsideNormalRange: "超出正常范围",
      keyFindings: "主要发现",
      keyFindingsList: [
        "血红蛋白显著偏低，为5.0 g/dL（正常：13-17 g/dL）",
        "淋巴细胞百分比略低于正常，为18%（正常：20-40%）",
        "白细胞计数、中性粒细胞、血小板和MCV均在正常范围内",
        "血红蛋白在过去6个月中呈下降趋势"
      ],
      criticalActionsTitle: "重要：与您的医生讨论",
      criticalActionsList: [
        "您的低血红蛋白水平需要立即就医和随访",
        "与您的医生讨论血红蛋白下降趋势，以确定根本原因",
        "询问关于补充铁剂、饮食改变或其他潜在治疗方法"
      ],
      nextStepsTitle: "建议的下一步措施",
      nextStepsList: [
        "在1-2周内安排与医疗服务提供者的随访预约",
        "与您的医生讨论您的症状（疲劳、虚弱、呼吸急促）",
        "您的医生可能会要求进行额外的检查以确定根本原因",
        "考虑记录症状日记与您的医疗服务提供者分享",
        "遵循医生开具的任何治疗建议"
      ],
      disclaimer: "此摘要由AI生成，以帮助您理解您的结果。它不能代替专业医疗建议。请务必就您的检查结果和治疗方案咨询您的医疗服务提供者。",
      downloadPdf: "下载PDF"
    },
    medicalTerms: {
      "Complete Blood Count (CBC)": "全血细胞计数（CBC）：一种血液检查，测量您血液的不同成分，包括红细胞、白细胞和血小板。",
      "Hemoglobin": "血红蛋白：红细胞中的一种蛋白质，将氧气从肺部输送到身体其他部位。"
    },
    results: [
      {
        name: "血红蛋白",
        value: "5 g/dL",
        range: "13 - 17 g/dL",
        status: "偏低",
        explanation: "血红蛋白是红细胞中的一种蛋白质，可将氧气输送到全身。您的水平明显低于正常，这意味着您的血液可能无法输送足够的氧气。这应立即与您的医生讨论。",
        sourceLevel: "高可靠性",
        sources: ["美国国立卫生研究院", "梅奥诊所"],
        trendInterpretation: "您的血红蛋白水平在过去几个月中一直在上升，这是一个积极的趋势。但是，它们仍然低于正常范围，应由您的医生监测。"
      },
      {
        name: "白细胞总数 (WBC)",
        value: "9.1 × 10³/μL",
        range: "4.6 - 10.8 × 10³/μL",
        status: "正常",
        explanation: "白细胞帮助对抗感染。您的计数在正常范围内，表明您的免疫系统运作正常。",
        sourceLevel: "中等可靠性",
        sources: ["美国临床化学协会"],
        trendInterpretation: "您的白细胞计数在过去几个月中一直保持稳定，这是一个好兆头。"
      },
      {
        name: "中性粒细胞",
        value: "79%",
        range: "40 - 80%",
        status: "正常",
        explanation: "中性粒细胞是最常见的白细胞类型，对抗细菌感染。您的百分比在正常范围内。",
        sourceLevel: "中等可靠性",
        sources: ["临床血液学参考标准"],
        trendInterpretation: "您的中性粒细胞百分比在过去几个月中略有下降，但仍在正常范围内。"
      },
      {
        name: "淋巴细胞",
        value: "18%",
        range: "20 - 40%",
        status: "偏低",
        explanation: "淋巴细胞是帮助您的身体对抗病毒感染的白细胞。您的百分比略低于正常。这可能由多种原因引起，您的医生可以确定是否需要关注。",
        sourceLevel: "高可靠性",
        sources: ["美国国立卫生研究院", "梅奥诊所"],
        trendInterpretation: "您的淋巴细胞百分比在过去几个月中一直在上升，这是一个积极的趋势。"
      },
      {
        name: "血小板计数",
        value: "3.5 lakh/cumm",
        range: "1.5 - 4.4 lakh/cumm",
        status: "正常",
        explanation: "血小板帮助您在受伤时凝血。您的血小板计数在健康范围内。",
        sourceLevel: "中等可靠性",
        sources: ["美国临床化学协会"],
        trendInterpretation: "您的血小板计数在过去几个月中一直保持稳定，这是一个好兆头。"
      },
      {
        name: "平均红细胞体积 (MCV)",
        value: "94.0 fL",
        range: "83 - 101 fL",
        status: "正常",
        explanation: "MCV测量您的红细胞的平均大小。您的值正常。",
        sourceLevel: "一般参考",
        sources: ["一般医学参考文献"],
        trendInterpretation: "您的MCV在过去几个月中一直保持稳定，这是一个好兆头。"
      }
    ],
    questionsTitle: "向医生提问的建议问题：",
    questions: [
      "是什么导致我的血红蛋白水平低，我需要什么治疗？",
      "我应该服用铁补充剂或改变饮食吗？",
      "我应该多久再次检查血液？",
      "在我的血红蛋白改善之前，我应该避免哪些活动？",
      "我应该注意哪些症状需要立即就医？"
    ]
  },
  spanish: {
    summary: "Los resultados de su Recuento Completo de Células Sanguíneas (CBC) muestran varias mediciones de sus células sanguíneas. Algunos de sus resultados están fuera del rango normal y deben ser discutidos con su médico, particularmente su nivel de hemoglobina que está más bajo de lo normal.",
    comprehensiveSummary: {
      title: "Resumen Integral",
      subtitle: "Sus resultados médicos de un vistazo",
      patient: "Paciente",
      testDate: "Fecha del Examen",
      reportType: "Tipo de Informe",
      reportTypeValue: "Recuento Completo de Células Sanguíneas (CBC)",
      resultsOverview: "Resumen de Resultados",
      normal: "Normal",
      outsideNormalRange: "fuera del rango normal",
      keyFindings: "Hallazgos Clave",
      keyFindingsList: [
        "La hemoglobina está significativamente baja a 5.0 g/dL (normal: 13-17 g/dL)",
        "El porcentaje de linfocitos está ligeramente por debajo de lo normal a 18% (normal: 20-40%)",
        "El recuento de glóbulos blancos, neutrófilos, plaquetas y MCV están todos dentro de los rangos normales",
        "La hemoglobina ha mostrado una tendencia decreciente en los últimos 6 meses"
      ],
      criticalActionsTitle: "Importante: Discuta con Su Médico",
      criticalActionsList: [
        "Su nivel bajo de hemoglobina requiere atención médica y seguimiento inmediato",
        "Discuta la tendencia decreciente de hemoglobina con su médico para identificar la causa subyacente",
        "Pregunte sobre la suplementación de hierro, cambios dietéticos u otros tratamientos potenciales"
      ],
      nextStepsTitle: "Próximos Pasos Recomendados",
      nextStepsList: [
        "Programe una cita de seguimiento con su proveedor de atención médica dentro de 1-2 semanas",
        "Discuta sus síntomas (fatiga, debilidad, falta de aire) con su médico",
        "Su médico puede ordenar pruebas adicionales para determinar la causa subyacente",
        "Considere llevar un diario de síntomas para compartir con su proveedor de atención médica",
        "Siga cualquier recomendación de tratamiento prescrita por su médico"
      ],
      disclaimer: "Este resumen es generado por IA para ayudarlo a entender sus resultados. No reemplaza el consejo médico profesional. Siempre consulte con su proveedor de atención médica sobre sus resultados de pruebas y opciones de tratamiento.",
      downloadPdf: "Descargar PDF"
    },
    medicalTerms: {
      "Complete Blood Count (CBC)": "Recuento Completo de Células Sanguíneas (CBC): Una prueba de sangre que mide diferentes componentes de su sangre incluyendo glóbulos rojos, glóbulos blancos y plaquetas.",
      "Hemoglobin": "Hemoglobina: Una proteína en los glóbulos rojos que transporta oxígeno desde sus pulmones al resto de su cuerpo."
    },
    results: [
      {
        name: "Hemoglobina",
        value: "5 g/dL",
        range: "13 - 17 g/dL",
        status: "bajo",
        explanation: "La hemoglobina es una proteína en sus glóbulos rojos que transporta oxígeno por todo el cuerpo. Su nivel está significativamente más bajo de lo normal, lo que significa que su sangre puede no estar transportando suficiente oxígeno. Esta condición se llama anemia y debe ser discutida con su médico de inmediato.",
        sourceLevel: "Alta confiabilidad",
        sources: ["Institutos Nacionales de Salud", "Clínica Mayo"],
        trendInterpretation: "Sus niveles de hemoglobina han estado aumentando en los últimos meses, lo cual es una tendencia positiva. Sin embargo, todavía están por debajo del rango normal y deben ser monitoreados por su médico."
      },
      {
        name: "Recuento Total de Leucocitos (WBC)",
        value: "9.1 × 10³/μL",
        range: "4.6 - 10.8 × 10³/μL",
        status: "normal",
        explanation: "Los glóbulos blancos ayudan a combatir infecciones. Su recuento está en el rango normal, lo que sugiere que su sistema inmunológico está funcionando correctamente.",
        sourceLevel: "Confiabilidad media",
        sources: ["Asociación Americana de Química Clínica"],
        trendInterpretation: "Su recuento de glóbulos blancos ha sido estable en los últimos meses, lo cual es una buena señal."
      },
      {
        name: "Neutrófilos",
        value: "79%",
        range: "40 - 80%",
        status: "normal",
        explanation: "Los neutrófilos son el tipo más común de glóbulo blanco que combate infecciones bacterianas. Su porcentaje está dentro del rango normal.",
        sourceLevel: "Confiabilidad media",
        sources: ["Estándares de Referencia de Hematología Clínica"],
        trendInterpretation: "Su porcentaje de neutrófilos ha estado disminuyendo ligeramente en los últimos meses, pero todavía está dentro del rango normal."
      },
      {
        name: "Linfocitos",
        value: "18%",
        range: "20 - 40%",
        status: "bajo",
        explanation: "Los linfocitos son glóbulos blancos que ayudan a su cuerpo a combatir infecciones virales. Su porcentaje está ligeramente más bajo de lo normal. Esto puede ocurrir por varias razones y su médico puede determinar si esto necesita atención.",
        sourceLevel: "Alta confiabilidad",
        sources: ["Institutos Nacionales de Salud", "Clínica Mayo"],
        trendInterpretation: "Su porcentaje de linfocitos ha estado aumentando en los últimos meses, lo cual es una tendencia positiva."
      },
      {
        name: "Recuento de Plaquetas",
        value: "3.5 lakh/cumm",
        range: "1.5 - 4.4 lakh/cumm",
        status: "normal",
        explanation: "Las plaquetas ayudan a que su sangre se coagule cuando está lesionado. Su recuento de plaquetas está dentro del rango saludable.",
        sourceLevel: "Confiabilidad media",
        sources: ["Asociación Americana de Química Clínica"],
        trendInterpretation: "Su recuento de plaquetas ha sido estable en los últimos meses, lo cual es una buena señal."
      },
      {
        name: "Volumen Corpuscular Medio (MCV)",
        value: "94.0 fL",
        range: "83 - 101 fL",
        status: "normal",
        explanation: "El MCV mide el tamaño promedio de sus glóbulos rojos. Su valor es normal.",
        sourceLevel: "Referencia general",
        sources: ["Referencias Médicas Generales"],
        trendInterpretation: "Su MCV ha sido estable en los últimos meses, lo cual es una buena señal."
      }
    ],
    questionsTitle: "Preguntas sugeridas para su médico:",
    questions: [
      "¿Qué está causando mi nivel bajo de hemoglobina y qué tratamiento necesito?",
      "¿Debo tomar suplementos de hierro o cambiar mi dieta?",
      "¿Con qué frecuencia debo hacerme la prueba de sangre nuevamente?",
      "¿Hay alguna actividad que deba evitar hasta que mi hemoglobina mejore?",
      "¿Qué síntomas debo vigilar que requerirían atención inmediata?"
    ]
  },
  arabic: {
    summary: "تُظهر نتائج اختبار تعداد الدم الكامل (CBC) عدة قياسات لخلايا الدم لديك. بعض نتائجك خارج النطاق الطبيعي ويجب مناقشتها مع طبيبك، خاصة مستوى الهيموغلوبين الذي هو أقل من الطبيعي.",
    comprehensiveSummary: {
      title: "ملخص شامل",
      subtitle: "نتائجك الطبية لمحة سريعة",
      patient: "المريض",
      testDate: "تاريخ الفحص",
      reportType: "نوع التقرير",
      reportTypeValue: "تعداد الدم الكامل (CBC)",
      resultsOverview: "نظرة عامة على النتائج",
      normal: "طبيعي",
      outsideNormalRange: "خارج النطاق الطبيعي",
      keyFindings: "النتائج الرئيسية",
      keyFindingsList: [
        "الهيموغلوبين منخفض بشكل كبير عند 5.0 g/dL (طبيعي: 13-17 g/dL) - يشير إلى فقر الدم",
        "نسبة الخلايا اللمفاوية أقل قليلاً من الطبيعي عند 18% (طبيعي: 20-40%)",
        "عدد كريات الدم البيضاء والعدلات والصفائح الدموية وMCV جميعها ضمن النطاقات الطبيعية",
        "أظهر الهيموغلوبين اتجاهًا تنازليًا خلال الأشهر الستة الماضية"
      ],
      criticalActionsTitle: "مهم: ناقش مع طبيبك",
      criticalActionsList: [
        "يتطلب مستوى الهيموغلوبين المنخفض لديك عناية طبية ومتابعة فورية",
        "ناقش اتجاه انخفاض الهيموغلوبين مع طبيبك لتحديد السبب الأساسي",
        "اسأل عن مكملات الحديد أو التغييرات الغذائية أو العلاجات الأخرى لفقر الدم"
      ],
      nextStepsTitle: "الخطوات التالية الموصى بها",
      nextStepsList: [
        "حدد موعدًا للمتابعة مع مقدم الرعاية الصحية الخاص بك خلال 1-2 أسابيع",
        "ناقش أعراضك (التعب، الضعف، ضيق التنفس) مع طبيبك",
        "قد يطلب طبيبك إجراء فحوصات إضافية لتحديد سبب فقر الدم",
        "فكر في الاحتفاظ بمذكرات الأعراض لمشاركتها مع مقدم الرعاية الصحية الخاص بك",
        "اتبع أي توصيات علاج يصفها طبيبك"
      ],
      disclaimer: "تم إنشاء هذا الملخص بواسطة الذكاء الاصطناعي لمساعدتك على فهم نتائجك. لا يحل محل المشورة الطبية المهنية. استشر دائمًا مقدم الرعاية الصحية الخاص بك حول نتائج اختباراتك وخيارات العلاج.",
      downloadPdf: "تحميل PDF"
    },
    medicalTerms: {
      "Complete Blood Count (CBC)": "تعداد الدم الكامل (CBC): فحص دم يقيس مكونات مختلفة من دمك بما في ذلك خلايا الدم الحمراء وخلايا الدم البيضاء والصفائح الدموية.",
      "Hemoglobin": "الهيموغلوبين: بروتين في خلايا الدم الحمراء ينقل الأكسجين من رئتيك إلى بقية جسمك."
    },
    results: [
      {
        name: "الهيموغلوبين",
        value: "5 g/dL",
        range: "13 - 17 g/dL",
        status: "منخفض",
        explanation: "الهيموغلوبين هو بروتين في خلايا الدم الحمراء ينقل الأكسجين في جميع أنحاء الجسم. مستواك أقل بكثير من الطبيعي، مما يعني أن دمك قد لا ينقل ما يكفي من الأكسجين. تسمى هذه الحالة فقر الدم ويجب مناقشتها مع طبيبك على الفور.",
        sourceLevel: "موثوقية عالية",
        sources: ["المعاهد الوطنية للصحة", "مايو كلينك"],
        trendInterpretation: "كانت مستويات الهيموغلوبين لديك تتزايد خلال الأشر القليلة الماضية، وهذا اتجاه إيجابي. ومع ذلك، لا تزال أقل من النطاق الطبيعي ويجب أن يراقبها طبيبك."
      },
      {
        name: "عدد كريات الدم البيضاء الكلي (WBC)",
        value: "9.1 × 10³/μL",
        range: "4.6 - 10.8 × 10³/μL",
        status: "طبيعي",
        explanation: "تساعد خلايا الدم البيضاء في مكافحة العدوى. عددك ضمن النطاق الطبيعي، مما يشير إلى أن جهازك المناعي يعمل بشكل صحيح.",
        sourceLevel: "موثوقية متوسطة",
        sources: ["الجمعية الأمريكية للكيمياء السريرية"],
        trendInterpretation: "كان عدد خلايا الدم البيضاء لديك مستقرًا خلال الأشهر القليلة الماضية، وهذه علامة جيدة."
      },
      {
        name: "العدلات",
        value: "79%",
        range: "40 - 80%",
        status: "طبيعي",
        explanation: "العدلات هي أكثر أنواع خلايا الدم البيضاء شيوعًا التي تحارب العدوى البكتيرية. نسبتك ضمن النطاق الطبيعي.",
        sourceLevel: "موثوقية متوسطة",
        sources: ["معايير المرجع أمراض الدم السريرية"],
        trendInterpretation: "كانت نسبة العدلات لديك تنخفض قليلاً خلال الأشهر القليلة الماضية، ولكنها لا تزال ضمن النطاق الطبيعي."
      },
      {
        name: "الخلايا اللمفاوية",
        value: "18%",
        range: "20 - 40%",
        status: "منخفض",
        explanation: "الخلايا اللمفاوية هي خلايا الدم البيضاء التي تساعد جسمك على محاربة العدوى الفيروسية. نسبتك أقل قليلاً من الطبيعي. يمكن أن يحدث هذا لأسباب متنوعة ويمكن لطبيبك تحديد ما إذا كان هذا يحتاج إلى اهتمام.",
        sourceLevel: "موثوقية عالية",
        sources: ["المعاهد الوطنية للصحة", "مايو كلينك"],
        trendInterpretation: "كانت نسبة الخلايا اللمفاوية لديك تتزايد خلال الأشهر القليلة الماضية، وهذا اتجاه إيجابي."
      },
      {
        name: "عدد الصفائح الدموية",
        value: "3.5 lakh/cumm",
        range: "1.5 - 4.4 lakh/cumm",
        status: "طبيعي",
        explanation: "تساعد الصفائح الدموية دمك على التجلط عندما تكون مصابًا. عدد الصفائح الدموية لديك ضمن النطاق الصحي.",
        sourceLevel: "موثوقية متوسطة",
        sources: ["الجمعية الأمريكية للكيمياء السريرية"],
        trendInterpretation: "كان عدد الصفائح الدموية لديك مستقرًا خلال الأشهر القليلة الماضية، وهذه علامة جيدة."
      },
      {
        name: "متوسط حجم الكريات (MCV)",
        value: "94.0 fL",
        range: "83 - 101 fL",
        status: "طبيعي",
        explanation: "يقيس MCV متوسط حجم خلايا الدم الحمراء لديك. قيمتك طبيعية.",
        sourceLevel: "مرجع عام",
        sources: ["المراجع الطبية العامة"],
        trendInterpretation: "كان MCV لديك مستقرًا خلال الأشهر القليلة الماضية، وهذه علامة جيدة."
      }
    ],
    questionsTitle: "أسئلة مقترحة لطبيبك:",
    questions: [
      "ما الذي يسبب انخفاض مستوى الهيموغلوبين لدي وما العلاج الذي أحتاجه؟",
      "هل يجب أن أتناول مكملات الحديد أو أغير نظامي الغذائي؟",
      "كم مرة يجب أن أفحص دمي مرة أخرى؟",
      "هل هناك أي أنشطة يجب أن أتجنبها حتى يتحسن الهيموغلوبين لدي؟",
      "ما هي الأعراض التي يجب أن أراقبها والتي تتطلب عناية فورية؟"
    ]
  },
  french: {
    summary: "Vos résultats de Formule Sanguine Complète (CBC) montrent plusieurs mesures de vos cellules sanguines. Certains de vos résultats sont en dehors de la plage normale et doivent être discutés avec votre médecin, en particulier votre taux d'hémoglobine qui est inférieur à la normale.",
    comprehensiveSummary: {
      title: "Résumé Complet",
      subtitle: "Vos résultats médicaux en un coup d'œil",
      patient: "Patient",
      testDate: "Date du Test",
      reportType: "Type de Rapport",
      reportTypeValue: "Formule Sanguine Complète (CBC)",
      resultsOverview: "Aperçu des Résultats",
      normal: "Normal",
      outsideNormalRange: "en dehors de la plage normale",
      keyFindings: "Constatations Clés",
      keyFindingsList: [
        "L'hémoglobine est significativement basse à 5.0 g/dL (normal: 13-17 g/dL) - indique une anémie",
        "Le pourcentage de lymphocytes est légèrement inférieur à la normale à 18% (normal: 20-40%)",
        "Le nombre de globules blancs, les neutrophiles, les plaquettes et le MCV sont tous dans les plages normales",
        "L'hémoglobine a montré une tendance à la baisse au cours des 6 derniers mois"
      ],
      criticalActionsTitle: "Important: Discutez avec Votre Médecin",
      criticalActionsList: [
        "Votre faible taux d'hémoglobine nécessite une attention médicale et un suivi immédiat",
        "Discutez de la tendance à la baisse de l'hémoglobine avec votre médecin pour identifier la cause sous-jacente",
        "Renseignez-vous sur la supplémentation en fer, les changements alimentaires ou d'autres traitements pour l'anémie"
      ],
      nextStepsTitle: "Prochaines Étapes Recommandées",
      nextStepsList: [
        "Planifiez un rendez-vous de suivi avec votre professionnel de la santé dans 1 à 2 semaines",
        "Discutez de vos symptômes (fatigue, faiblesse, essoufflement) avec votre médecin",
        "Votre médecin peut commander des tests supplémentaires pour d��terminer la cause de l'anémie",
        "Envisagez de tenir un journal des symptômes à partager avec votre professionnel de la santé",
        "Suivez toutes les recommandations de traitement prescrites par votre médecin"
      ],
      disclaimer: "Ce résumé est généré par IA pour vous aider à comprendre vos résultats. Il ne remplace pas les conseils médicaux professionnels. Consultez toujours votre professionnel de la santé au sujet de vos résultats de tests et de vos options de traitement.",
      downloadPdf: "Télécharger PDF"
    },
    medicalTerms: {
      "Complete Blood Count (CBC)": "Formule Sanguine Complète (CBC): Un test sanguin qui mesure différents composants de votre sang, y compris les globules rouges, les globules blancs et les plaquettes.",
      "Hemoglobin": "Hémoglobine: Une protéine dans les globules rouges qui transporte l'oxygène de vos poumons vers le reste de votre corps."
    },
    results: [
      {
        name: "Hémoglobine",
        value: "5 g/dL",
        range: "13 - 17 g/dL",
        status: "faible",
        explanation: "L'hémoglobine est une protéine dans vos globules rouges qui transporte l'oxygène dans tout votre corps. Votre niveau est significativement inférieur à la normale, ce qui signifie que votre sang peut ne pas transporter suffisamment d'oxygène. Cette condition s'appelle l'anémie et doit être discutée avec votre médecin immédiatement.",
        sourceLevel: "Haute fiabilité",
        sources: ["Instituts Nationaux de la Santé", "Clinique Mayo"],
        trendInterpretation: "Vos niveaux d'hémoglobine ont augmenté au cours des derniers mois, ce qui est une tendance positive. Cependant, ils sont toujours en dessous de la plage normale et doivent tre surveillés par votre médecin."
      },
      {
        name: "Numération Totale des Leucocytes (WBC)",
        value: "9.1 × 10³/μL",
        range: "4.6 - 10.8 × 10³/μL",
        status: "normal",
        explanation: "Les globules blancs aident à combattre les infections. Votre compte est dans la plage normale, ce qui suggère que votre système immunitaire fonctionne correctement.",
        sourceLevel: "Fiabilité moyenne",
        sources: ["Association Américaine de Chimie Clinique"],
        trendInterpretation: "Votre nombre de globules blancs a été stable au cours des derniers mois, ce qui est un bon signe."
      },
      {
        name: "Neutrophiles",
        value: "79%",
        range: "40 - 80%",
        status: "normal",
        explanation: "Les neutrophiles sont le type le plus courant de globules blancs qui combattent les infections bactériennes. Votre pourcentage est dans la plage normale.",
        sourceLevel: "Fiabilité moyenne",
        sources: ["Normes de Référence en Hématologie Clinique"],
        trendInterpretation: "Votre pourcentage de neutrophiles a légèrement diminué au cours des derniers mois, mais il est toujours dans la plage normale."
      },
      {
        name: "Lymphocytes",
        value: "18%",
        range: "20 - 40%",
        status: "faible",
        explanation: "Les lymphocytes sont des globules blancs qui aident votre corps à combattre les infections virales. Votre pourcentage est légèrement inférieur à la normale. Cela peut se produire pour diverses raisons et votre médecin peut déterminer si cela nécessite une attention.",
        sourceLevel: "Haute fiabilité",
        sources: ["Instituts Nationaux de la Santé", "Clinique Mayo"],
        trendInterpretation: "Votre pourcentage de lymphocytes a augmenté au cours des derniers mois, ce qui est une tendance positive."
      },
      {
        name: "Numération Plaquettaire",
        value: "3.5 lakh/cumm",
        range: "1.5 - 4.4 lakh/cumm",
        status: "normal",
        explanation: "Les plaquettes aident votre sang à coaguler lorsque vous êtes blessé. Votre numération plaquettaire est dans la plage saine.",
        sourceLevel: "Fiabilité moyenne",
        sources: ["Association Américaine de Chimie Clinique"],
        trendInterpretation: "Votre numération plaquettaire a été stable au cours des derniers mois, ce qui est un bon signe."
      },
      {
        name: "Volume Corpusculaire Moyen (MCV)",
        value: "94.0 fL",
        range: "83 - 101 fL",
        status: "normal",
        explanation: "Le MCV mesure la taille moyenne de vos globules rouges. Votre valeur est normale.",
        sourceLevel: "Référence générale",
        sources: ["Références Médicales Générales"],
        trendInterpretation: "Votre MCV a été stable au cours des derniers mois, ce qui est un bon signe."
      }
    ],
    questionsTitle: "Questions suggérées pour votre médecin:",
    questions: [
      "Qu'est-ce qui cause mon faible taux d'hémoglobine et quel traitement ai-je besoin?",
      "Dois-je prendre des suppléments de fer ou changer mon alimentation?",
      "À quelle fréquence dois-je faire tester mon sang à nouveau?",
      "Y a-t-il des activités que je devrais éviter jusqu'à ce que mon hémoglobine s'améliore?",
      "Quels symptômes dois-je surveiller qui nécessiteraient une attention immédiate?"
    ]
  },
  hindi: {
    summary: "आपके पूर्ण रक्त गणना (CBC) परीक्षण के परिणाम आपकी रक्त कोशिकाओं के कई माप दिखाते हैं। आपके कुछ परिणाम सामान्य सीमा से बाहर हैं और आपके डॉक्टर के साथ चर्चा की जानी चाहिए, विशेष रूप से आपका हीमोग्लोबिन स्तर जो सामान्य से क है।",
    comprehensiveSummary: {
      title: "व्यापक सारांश",
      subtitle: "एक नज़र में आपके चिकित्सा परिणाम",
      patient: "रोगी",
      testDate: "परीक्षण तिथि",
      reportType: "रिपोर्ट का प्रकार",
      reportTypeValue: "पूर्ण रक्त गणना (CBC)",
      resultsOverview: "परिणाम अवलोकन",
      normal: "सामान्य",
      outsideNormalRange: "सामान्य सीमा से बाहर",
      keyFindings: "मुख्य निष्कर्ष",
      keyFindingsList: [
        "हीमोग्लोबिन 5.0 g/dL पर काफी कम है (सामान्य: 13-17 g/dL) - एनीमिया का संकेत देता है",
        "लिम्फोसाइट प्रतिशत 18% पर सामान्य से थोड़ा कम है (सामान्य: 20-40%)",
        "सफेद रक्त कोशिका गणना, न्यूट्रोफिल, प्लेटलेट्स और MCV सभी सामान्य सीमा के भीतर हैं",
        "हीमोग्लोबिन ने पिछले 6 महीनों मे गिरावट की प्रवृत्ति दिखाई है"
      ],
      criticalActionsTitle: "महत्वपूर्ण: अपने डॉक्टर से चर्चा करें",
      criticalActionsList: [
        "आपके कम हीमोग्लोबिन स्तर को तत्काल चिकित्सा ध्यान और अनुवर्ती कार्रवाई की आवश्यकता है",
        "अंतर्निहित कारण की पहचान करने के लिए अपने डॉक्टर के साथ घटते हीमोग्लोबिन की प्रवृत्ति पर चरचा करें",
        "आयरन सप्लीमेंटेशन, आहार परिवर्तन, या एनीमिया के अन्य उपचारों के बारे में पूछें"
      ],
      nextStepsTitle: "अनुशंसित अगले कदम",
      nextStepsList: [
        "1-2 सप्ताह के भीतर अपने स्वास्थ्य सेवा प्रदाता के साथ अनुवर्ती नियुक्ति निर्धारित करें",
        "अपने डॉक्टर के साथ अपने ल्षणों (थकान, कमजोरी, सांस की तकलीफ) पर चर्चा करें",
        "आपका डॉक्टर एनीमिया के कारण को निर्धारित करने के लिए अतिरिक्त परीक्षणों का आदेश दे सकता है",
        "अपने स्वास्थ्य सेवा प्रदाता के साथ साझा करने के लिए लक्षण डायरी रखने पर विचार करें",
        "अपने डॉक्टर द्वारा निर्धारित किसी भी उपचार की सिफारिशों का पालन करें"
      ],
      disclaimer: "यह सारांश AI द्वारा आपको अपने परिणामों को समझने में मदद करने के लिए उत्पन्न किया गया है। यह पेशेवर चिकित्सा सलाह की जगह नहीं लेता है। अपने परीक्षण परिणामों और उपचार विकल्पों के बारे में हमेशा अपने स्वास्थ्य सेवा प्रदाता से परमर्श लें।",
      downloadPdf: "PDF डाउनलोड करें"
    },
    medicalTerms: {
      "Complete Blood Count (CBC)": "पूर्ण रक्त गणना (CBC): एक रक्त परीक्षण जो आपके रक्त के विभिन्न घटकों को मापता है जिसमें लाल रक्त कोशिकाएं, सफेद रक्त कोशिकाएं और प्लेटलेट्स शामिल हैं।",
      "Hemoglobin": "हीमोग्लोबिन: लाल रक्त कोशिकाओं में एक प्रोटीन जो आपके फेफड़ों से आपके शरीर के बाकी हिस्सों में ऑक्सीजन ले जाता है।"
    },
    results: [
      {
        name: "हीमोग्लोबिन",
        value: "5 g/dL",
        range: "13 - 17 g/dL",
        status: "कम",
        explanation: "हीमोग्लोबिन आपकी लाल रक्त कोशिकाओं में एक प्रोटीन है जो पूरे शरीर में ऑक्सीजन ले जाता है। आपका स्तर सामान्य से काफी कम है, जिसका मतल है कि आपका रक्त पर्याप्त ऑक्सीजन नहीं ले जा रहा है। इस स्थिति को एनीमिया कहा जाता है और इसे तुरंत अपने डॉक्टर से चर्चा करनी चाहिए।",
        sourceLevel: "उच्च विश्वसनीयता",
        sources: ["राष्ट्रीय स्वास्थ्य संस्थान", "मेयो क्लिनिक"],
        trendInterpretation: "आपका हीमोग्लोबिन स्तर पिछले कुछ महीनों में ढ़ रहा है, जो एक सकारात्मक प्रवृत्ति है। हालांकि, वे अभी भी सामान्य सीमा से नीचे हैं और आपके डॉक्टर द्वारा निगरानी की जानी चाहिए।"
      },
      {
        name: "कुल ल्यूकोसाइट गणना (WBC)",
        value: "9.1 × 10³/μL",
        range: "4.6 - 10.8 × 10³/μL",
        status: "सामान्य",
        explanation: "सफेद रक्त कोशिकाएं संक्रमण से लड़ने में मदद करी हैं। आपकी गणना सामान्य सीमा में है, जो सुझाव देती है कि आपकी प्रतिरक्षा प्रणाली ठीक से काम कर रही है।",
        sourceLevel: "मध्यम विश्वसनीयता",
        sources: ["अमेरिकन एसोसिएशन फॉर क्लिनिकल केमिस्ट्री"],
        trendInterpretation: "आपकी सफेद रक्त कोशिका गणना पिछले कुछ महीनों में स्थिर रही है, जो एक अच्छा सकेत है।"
      },
      {
        name: "न्यूट्रोफिल",
        value: "79%",
        range: "40 - 80%",
        status: "सामान्य",
        explanation: "न्यूट्रोफिल सफेद रक्त कोशिका का सबसे आम प्रकार है जो बैक्टीरियल संक्रमण से लड़ता है। आपका प्रतिशत सामान्य सीमा के भीतर है।",
        sourceLevel: "मध्यम विश्वसनीयता",
        sources: ["क्लिनिकल हेमेटोलॉजी संद्भ मानक"],
        trendInterpretation: "आपका न्यूट्रोफिल प्रतिशत पिछले कुछ महीनों में थोड़ा कम हो रहा है, लेकिन यह अभी भी सामान्य सीमा के भीतर है।"
      },
      {
        name: "लिम्फोसाइट",
        value: "18%",
        range: "20 - 40%",
        status: "कम",
        explanation: "लिम्फोसाइट्स सफेद रक्त कोशिकाएं हैं जो आपके शरीर को वायरल संक्रमण से लड़ने ें मदद करती हैं। आपका प्रतिशत सामान्य से थोड़ा कम है। यह विभिन्न कारणों से हो सकता है और आपका डॉक्टर निर्धारित कर सकता है कि क्या इस पर ध्यान देने की आवश्यकता है।",
        sourceLevel: "उच्च विश्वसनीयता",
        sources: ["राष्ट्रीय स्वास्थ्य संस्थान", "मेयो क्लिनिक"],
        trendInterpretation: "आपका लिम्फोसाइट प्रतिशत पिछले कुछ महीनों में बढ़ रहा है, जो एक सकारात्मक प्रवृत्ति है।"
      },
      {
        name: "प्लेटलेट गणना",
        value: "3.5 lakh/cumm",
        range: "1.5 - 4.4 lakh/cumm",
        status: "सामान्य",
        explanation: "प्लेटलेट्स आपके रक्त को थक्का बनाने में मदद करते हैं जब आप घायल होते हैं। आपकी प्लेटलेट गणना स्वस्थ सीमा के भीतर है।",
        sourceLevel: "मध्यम विश्वसनीयता",
        sources: ["अमेरिकन एसोसिएशन फॉर क्लिनिकल केमिस्ट्री"],
        trendInterpretation: "आपकी प्लेटलेट गणना पिछले कुछ महीनों में स्थिर रही है, जो एक अच्छा संकेत है।"
      },
      {
        name: "औसत कॉर्पस्कुलर वॉल्यूम (MCV)",
        value: "94.0 fL",
        range: "83 - 101 fL",
        status: "सामान्य",
        explanation: "MCV आपकी लाल रक्त कोशिकाओं के औसत आकार को मापता है। आपका मूल्य सामान्य है。",
        sourceLevel: "सामान्य संदर्भ",
        sources: ["सामान्य चिकित्सा संदर्भ"],
        trendInterpretation: "आपका MCV पिछले कुछ महीनों में स्थिर रहा है, जो एक अच्छा संकेत है।"
      }
    ],
    questionsTitle: "अपने डॉक्टर से पूछने के लिए सुझाए गए प्रश्न:",
    questions: [
      "मेरे कम हीमोग्लोबिन स्तर का कारण क्या है और मुझे किस उपचार की आवश्यकता है?",
      "क्या मुझे आयरन सप्लीमेंट लेना चाहिए या अपने आहार को बदलना चाहिए?",
      "मुझे कितनी बार अपना रक्त परीक्षण दोबारा करवाना चाहिए?",
      "क्या कोई गतिविधियाँ हैं जिनसे मुझे बचना चाहिए जब तक कि मेरा हीमोग्लोबिन सुधर न जाए?",
      "मुझे किन लक्षणों पर नज़र रखनी चाहिए जिनके लिए तुरंत ध्यान देने की आवश्यकता होगी?"
    ]
  }
};

export function TranslationPanel({ language, explanation }: TranslationPanelProps) {
  if (language === 'english') return null;

  const translated = translations[language] || translations.chinese;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg text-gray-900">Translated Explanation</h3>
      </div>
      
      {/* Translated Comprehensive Summary */}
      {translated.comprehensiveSummary && (
        <div className="bg-white rounded-lg shadow-lg border-2 border-purple-300 overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl mb-1">{translated.comprehensiveSummary.title}</h3>
                <p className="text-purple-100 text-sm">{translated.comprehensiveSummary.subtitle}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-purple-100 mb-1">{translated.comprehensiveSummary.patient}</p>
                <p className="text-lg">Emily Li</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-purple-100 mb-1">{translated.comprehensiveSummary.testDate}</p>
                <p className="text-lg">
                  {language === 'chinese' && '2026年2月12日'}
                  {language === 'spanish' && '12 de febrero de 2026'}
                  {language === 'arabic' && '12 فبراير 2026'}
                  {language === 'french' && '12 février 2026'}
                  {language === 'hindi' && '12 फरवरी 2026'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm text-purple-100 mb-1">{translated.comprehensiveSummary.reportType}</p>
                <p className="text-sm">{translated.comprehensiveSummary.reportTypeValue}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Results Overview */}
            <div>
              <h4 className="text-gray-900 mb-3">{translated.comprehensiveSummary.resultsOverview}</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: '67%' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        4 {translated.comprehensiveSummary.normal}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  2 {translated.comprehensiveSummary.outsideNormalRange}
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h4 className="text-gray-900 mb-3">{translated.comprehensiveSummary.keyFindings}</h4>
              <ul className="space-y-2">
                {translated.comprehensiveSummary.keyFindingsList.map((finding: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Actions */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-orange-900 mb-3">{translated.comprehensiveSummary.criticalActionsTitle}</h4>
              <ul className="space-y-2">
                {translated.comprehensiveSummary.criticalActionsList.map((action: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-orange-800">
                    <span className="text-orange-600 flex-shrink-0">⚠</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-blue-900 mb-3">{translated.comprehensiveSummary.nextStepsTitle}</h4>
              <ul className="space-y-2">
                {translated.comprehensiveSummary.nextStepsList.map((step: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                    <span className="text-blue-600 flex-shrink-0">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-4">
              {translated.comprehensiveSummary.disclaimer}
            </div>
          </div>
        </div>
      )}
      
      {/* Translated Summary */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-gray-700 leading-relaxed">{translated.summary}</p>
      </div>

      {/* Translated Medical Terms */}
      {translated.medicalTerms && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="text-gray-900 mb-3 font-semibold">
            {language === 'chinese' && '医学术语'}
            {language === 'spanish' && 'Términos Médicos'}
            {language === 'arabic' && 'المصطلحات الطبية'}
            {language === 'french' && 'Termes Médicaux'}
            {language === 'hindi' && 'चिकित्सा शर्तें'}
          </h4>
          <div className="space-y-2">
            {Object.entries(translated.medicalTerms).map(([term, definition], index) => (
              <div key={index} className="text-sm border-l-2 border-purple-300 pl-3 py-1">
                <p className="text-gray-700 leading-relaxed">{definition as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Translated Results */}
      <div className="space-y-3">
        {translated.results && translated.results.map((result: any, index: number) => (
          <div key={index} className="bg-white rounded-lg p-4">
            <h4 className="text-gray-900 mb-2 font-semibold">{result.name}</h4>
            <div className="flex items-center gap-3 text-sm mb-3">
              <span className="text-gray-700">
                <strong>
                  {language === 'chinese' && '您的值'}
                  {language === 'spanish' && 'Su Valor'}
                  {language === 'arabic' && 'قيمتك'}
                  {language === 'french' && 'Votre Valeur'}
                  {language === 'hindi' && 'आपका मूल्य'}
                  {!['chinese', 'spanish', 'arabic', 'french', 'hindi'].includes(language) && 'Value'}
                </strong>: {result.value}
              </span>
              <span className="text-gray-500">
                {language === 'chinese' && '正常范围'}
                {language === 'spanish' && 'Rango Normal'}
                {language === 'arabic' && 'النطاق الطبيعي'}
                {language === 'french' && 'Plage Normale'}
                {language === 'hindi' && 'सामान्य सीमा'}
                {!['chinese', 'spanish', 'arabic', 'french', 'hindi'].includes(language) && 'Normal Range'}: {result.range}
              </span>
            </div>
            
            {/* Status Badge */}
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                result.status.includes('正常') || result.status.includes('normal') || result.status.includes('طبيعي') || result.status.includes('सामान्य')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {result.status}
              </span>
            </div>

            {/* Explanation */}
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{result.explanation}</p>
            
            {/* Source Indicator */}
            {result.sourceLevel && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                    result.sourceLevel.includes('高') || result.sourceLevel.includes('Alta') || result.sourceLevel.includes('عالية') || result.sourceLevel.includes('Haute') || result.sourceLevel.includes('उच्च')
                      ? 'bg-green-500'
                      : result.sourceLevel.includes('中') || result.sourceLevel.includes('media') || result.sourceLevel.includes('متوسطة') || result.sourceLevel.includes('moyenne') || result.sourceLevel.includes('मध्यम')
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">{result.sourceLevel}</p>
                    <p className="text-xs text-gray-600">{result.sources.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trend Interpretation */}
            {result.trendInterpretation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">
                  {language === 'chinese' && '趋势分析'}
                  {language === 'spanish' && 'Análisis de Tendencia'}
                  {language === 'arabic' && 'تحليل الاتجاه'}
                  {language === 'french' && 'Analyse de Tendance'}
                  {language === 'hindi' && 'प्रवृत्ति विश्लेषण'}
                </p>
                <p className="text-xs text-blue-800 leading-relaxed">{result.trendInterpretation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Translated Questions */}
      {translated.questions && (
        <div className="bg-white rounded-lg p-4 mt-4">
          <h4 className="text-gray-900 mb-3 font-semibold">{translated.questionsTitle}</h4>
          <ul className="space-y-2">
            {translated.questions.map((question: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-sm text-gray-700">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-purple-700 mt-4 italic">
        {language === 'chinese' 
          ? '注意：此翻译由AI提供，可能不完美。请咨询您的医疗服务提供者以获得准确的医疗建议。'
          : language === 'spanish'
          ? 'Nota: Esta traducción es generada por IA y puede no ser perfecta. Por favor, consulte a su proveedor de atención médica para obtener asesoramiento médico preciso.'
          : language === 'arabic'
          ? 'ملاحظة: هذه الترجمة تم إنشاؤها بواسطة الذكاء الاصطناعي وقد لا تكون مثالية. يرجى استشارة مقدم الرعاية الصحية الخاص بك للحصول على المشورة الطبية ادقة.'
          : language === 'french'
          ? 'Remarque : Cette traduction est générée par IA et peut ne pas être parfaite. Veuillez consulter votre professionnel de la santé pour des conseils médicaux précis.'
          : language === 'hindi'
          ? 'नोट: यह अनुवाद AI द्वारा उत्पन्न है और सही नहीं हो सकता है। सटीक चिकित्सा सलाह के लिए कृपया अपने स्वास्थ्य सेवा प्रदाता से परामर्श करें।'
          : 'Note: This translation is AI-generated and may not be perfect. Please consult your healthcare provider for accurate medical advice.'}
      </p>
    </div>
  );
}