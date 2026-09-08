export const concepts = [
  { term: 'التعلّم الآلي', definition: 'طريقة تتيح للحاسوب تعلّم أنماط من البيانات واستخدامها للتنبؤ، بدل كتابة قاعدة منفصلة لكل حالة.', example: 'نموذج يتعلّم من أسعار منازل سابقة ليقدّر سعر منزل جديد.', question: 'ما الفكرة الأساسية للتعلّم الآلي؟', options: ['تعلّم الأنماط من البيانات', 'حفظ جميع الإجابات يدويًا', 'الاستغناء عن البيانات', 'تنفيذ قواعد ثابتة فقط'] },
  { term: 'التعلّم الخاضع للإشراف', definition: 'تدريب نموذج على أمثلة تحتوي المدخلات والإجابات الصحيحة المعروفة مسبقًا.', example: 'صور مكتوب عليها قط أو كلب لتدريب نموذج تصنيف.', question: 'ما الذي يميّز بيانات التعلّم الخاضع للإشراف؟', options: ['تحتوي على تسميات أو إجابات صحيحة', 'لا تحتوي على أي تسميات', 'يجب أن تكون صورًا فقط', 'لا يمكن استخدامها للتنبؤ'] },
  { term: 'التعلّم غير الخاضع للإشراف', definition: 'اكتشاف مجموعات أو بنى في بيانات لا تحتوي على تسميات جاهزة.', example: 'تجميع العملاء حسب تشابه سلوكهم الشرائي.', question: 'أي مهمة تُعد مثالًا على التعلّم غير الخاضع للإشراف؟', options: ['تجميع العملاء المتشابهين', 'تصنيف صور معلّمة مسبقًا', 'توقّع سعر من أسعار معلومة', 'حساب مجموع رقمين'] },
  { term: 'فرط التعلّم', definition: 'عندما يحفظ النموذج تفاصيل بيانات التدريب وضجيجها، فيضعف أداؤه على بيانات جديدة.', example: 'دقة مرتفعة جدًا في التدريب وأقل بكثير في الاختبار.', question: 'ما المؤشر الشائع لفرط التعلّم؟', options: ['أداء تدريب ممتاز وأداء اختبار ضعيف', 'أداء جيد على بيانات جديدة', 'تقليل تعقيد النموذج', 'تقسيم البيانات إلى مجموعات'] },
  { term: 'بيانات الاختبار', definition: 'بيانات منفصلة عن التدريب تُستخدم لتقييم أداء النموذج على أمثلة لم يتعلّم منها.', example: 'حجز جزء من بيانات المنازل لتقييم التنبؤ بعد انتهاء التدريب.', question: 'لماذا نحتفظ ببيانات اختبار منفصلة؟', options: ['لقياس التعميم على أمثلة جديدة', 'لتدريب النموذج عليها كل مرة', 'لزيادة عدد الخصائص فقط', 'لضمان دقة كاملة'] },
  { term: 'التصنيف', definition: 'توقّع فئة منفصلة مثل بريد مزعج أو غير مزعج.', example: 'تحديد ما إذا كانت رسالة بريد احتيالية.', question: 'أي مسألة تُعد تصنيفًا؟', options: ['تحديد بريد مزعج أو سليم', 'توقّع درجة الحرارة', 'تقدير سعر المنزل', 'توقّع كمية المبيعات'] },
  { term: 'الانحدار', definition: 'توقّع قيمة عددية مستمرة اعتمادًا على الخصائص المتاحة.', example: 'توقّع سعر منزل بناءً على المساحة والموقع.', question: 'أي مسألة تُعد انحدارًا؟', options: ['توقّع سعر منزل', 'تمييز القطط عن الكلاب', 'تحديد نوع الرسالة', 'تصنيف نوع النبات'] },
  { term: 'الخصائص', definition: 'المعلومات المدخلة التي يستخدمها النموذج لاكتشاف الأنماط واتخاذ التنبؤات.', example: 'مساحة المنزل وعدد الغرف والموقع.', question: 'ما المقصود بالخصائص في نموذج تنبؤ أسعار المنازل؟', options: ['المساحة والموقع وعدد الغرف', 'الإجابة النهائية فقط', 'اسم البرنامج فقط', 'عدد مرات تشغيل الحاسوب'] },
  { term: 'التعميم', definition: 'قدرة النموذج على تقديم نتائج جيدة عند التعامل مع بيانات جديدة غير موجودة في التدريب.', example: 'نموذج يتعرّف إلى صور جديدة للقطط بعد التدريب على صور مختلفة.', question: 'ماذا يعني التعميم؟', options: ['الأداء الجيد على بيانات جديدة', 'حفظ بيانات التدريب حرفيًا', 'تجاهل مجموعة الاختبار', 'زيادة عدد القواعد اليدوية'] },
  { term: 'التحقق', definition: 'استخدام مجموعة بيانات منفصلة أثناء التطوير لاختيار إعدادات النموذج دون استخدام مجموعة الاختبار النهائية.', example: 'مقارنة درجتين من تعقيد النموذج على بيانات التحقق.', question: 'ما دور مجموعة التحقق؟', options: ['اختيار إعدادات النموذج أثناء التطوير', 'استبدال جميع بيانات التدريب', 'ضمان عدم وجود أخطاء', 'إلغاء الحاجة للاختبار'] },
]

export function makeSamplePdf() {
  const lines = [
    'DAHIH / STUDY NOTES', 'Introduction to Machine Learning', '',
    '01  Learning from data', 'Machine learning finds patterns in examples to make predictions.',
    'Supervised learning uses labeled examples.', 'Unsupervised learning discovers structure without labels.', '',
    '02  Training and evaluation', 'Features are the inputs used by a model.',
    'Training data teaches the model. Validation helps choose settings.',
    'Test data measures performance on unseen examples.', '',
    '03  Tasks and pitfalls', 'Classification predicts categories. Regression predicts numbers.',
    'Overfitting means learning training details that do not generalize.',
    'Generalization is good performance on new data.', '',
    'Practice: Explain the difference between classification and regression.',
    'This is a built-in demonstration document.',
  ]
  const stream = 'BT /F1 13 Tf 50 780 Td 23 TL\n' + lines.map((line, i) => (i ? 'T* ' : '') + '(' + line + ') Tj').join('\n') + '\nET'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + Buffer.byteLength(stream) + ' >>\nstream\n' + stream + '\nendstream',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, i) => { offsets.push(Buffer.byteLength(pdf)); pdf += (i + 1) + ' 0 obj\n' + object + '\nendobj\n' })
  const xref = Buffer.byteLength(pdf)
  pdf += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('')
  pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF'
  return Buffer.from(pdf)
}
