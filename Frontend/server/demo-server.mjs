import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { concepts, makeSamplePdf } from './demo-data.mjs'

export function createDemoServer() {
  const pdf = makeSamplePdf()
  const documents = new Map([['sample', { id: 'sample', title: 'مقدمة في التعلّم الآلي', name: 'machine-learning.pdf', size: pdf.length, createdAt: new Date().toISOString(), sample: true, bytes: pdf }]])
  const cards = new Map()
  const quizzes = new Map()
  const chats = new Map()
  const activity = [{ id: randomUUID(), title: 'المستند التجريبي جاهز للدراسة', createdAt: new Date().toISOString() }]
  let profile = { name: 'أحمد', goal: 'خطوة صغيرة كل يوم، فهم أعمق كل مرة.' }
  const log = title => { activity.unshift({ id: randomUUID(), title, createdAt: new Date().toISOString() }); activity.splice(30) }
  const publicDoc = ({ bytes, ...doc }) => doc
  const publicQuiz = quiz => ({ ...quiz, questions: quiz.questions.map(({ correct, explanation, ...q }) => q) })
  function fail(status, message) { throw Object.assign(new Error(message), { status }) }
  function docFor(id) { const doc = documents.get(id); if (!doc) fail(404, 'المستند غير موجود أو انتهت جلسة التجربة.'); return doc }
  async function body(req) {
    const chunks = []; let size = 0
    for await (const chunk of req) { size += chunk.length; if (size > 15 * 1024 * 1024) fail(413, 'الملف أكبر من الحد المسموح.'); chunks.push(chunk) }
    try { return JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { fail(400, 'طلب غير صالح.') }
  }
  function makeCards(documentId) {
    const existing = [...cards.values()].filter(c => c.documentId === documentId)
    if (existing.length) return existing
    return concepts.slice(0, 6).map(c => {
      const card = { id: randomUUID(), documentId, question: 'ما المقصود بـ ' + c.term + '؟', answer: c.definition, example: c.example, favorite: false, reviewed: false }
      cards.set(card.id, card); return card
    })
  }
  makeCards('sample')
  return createServer(async (req, res) => {
    const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)) }
    try {
      const origin = req.headers.origin
      if (origin && !/^http:\/\/(localhost|127\.0\.0\.1):(5173|4173|3001)$/.test(origin)) fail(403, 'مصدر الطلب غير مسموح.')
      const url = new URL(req.url, 'http://localhost')
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] !== 'api') return send(404, { error: 'المسار غير موجود.' })
      const [, type, id, action] = parts
      const method = req.method
      if (type === 'health') return send(200, { mode: 'demo', database: false, ai: 'simulated' })
      if (type === 'dashboard' && method === 'GET') return send(200, {
        documents: documents.size, cards: cards.size, quizzes: quizzes.size,
        reviewed: [...cards.values()].filter(c => c.reviewed).length,
        completed: [...quizzes.values()].filter(q => q.result).length,
        favorites: [...cards.values()].filter(c => c.favorite).length,
        storage: [...documents.values()].reduce((n, d) => n + d.size, 0), activity,
        recent: [...documents.values()].map(publicDoc).reverse().slice(0, 3),
      })
      if (type === 'profile') {
        if (method === 'PATCH') {
          const data = await body(req)
          if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 60) fail(400, 'اكتب اسمًا من 1 إلى 60 حرفًا.')
          profile = { name: data.name.trim(), goal: String(data.goal || '').slice(0, 180) }
          log('تم تحديث الملف الشخصي')
        }
        return send(200, profile)
      }
      if (type === 'documents') {
        if (!id && method === 'GET') return send(200, [...documents.values()].map(publicDoc).reverse())
        if (!id && method === 'POST') {
          const data = await body(req)
          if (typeof data.name !== 'string' || !data.name.toLowerCase().endsWith('.pdf') || typeof data.data !== 'string') fail(400, 'اختر ملف PDF.')
          const bytes = Buffer.from(data.data, 'base64')
          if (bytes.length > 10 * 1024 * 1024) fail(413, 'الحد الأقصى لكل ملف 10 MB.')
          if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) fail(400, 'الملف ليس PDF صالحًا.')
          const total = [...documents.values()].reduce((n, d) => n + d.size, 0)
          if (total + bytes.length > 50 * 1024 * 1024) fail(413, 'مساحة الجلسة ممتلئة (50 MB). احذف مستندًا وحاول مجددًا.')
          const document = { id: randomUUID(), title: data.name.replace(/\.pdf$/i, '').slice(0, 120), name: data.name.slice(0, 150), size: bytes.length, bytes, sample: false, createdAt: new Date().toISOString() }
          documents.set(document.id, document); log('رفعت مستند: ' + document.title)
          return send(201, publicDoc(document))
        }
        const doc = docFor(id)
        if (method === 'GET' && action === 'file') {
          res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': doc.bytes.length, 'Content-Disposition': 'inline; filename="study.pdf"', 'Cache-Control': 'no-store' })
          return res.end(doc.bytes)
        }
        if (method === 'GET') return send(200, publicDoc(doc))
        if (method === 'DELETE') {
          documents.delete(id); chats.delete(id)
          for (const [key, card] of cards) if (card.documentId === id) cards.delete(key)
          for (const [key, quiz] of quizzes) if (quiz.documentId === id) quizzes.delete(key)
          log('حذفت مستند: ' + doc.title); return send(200, { ok: true })
        }
      }
      if (type === 'cards') {
        if (method === 'GET') return send(200, [...cards.values()].filter(c => !url.searchParams.has('documentId') || c.documentId === url.searchParams.get('documentId')))
        const card = cards.get(id); if (!card) fail(404, 'البطاقة غير موجودة.')
        if (method === 'PATCH') {
          const data = await body(req)
          if (typeof data.favorite === 'boolean') card.favorite = data.favorite
          if (data.reviewed === true && !card.reviewed) { card.reviewed = true; log('راجعت بطاقة تعليمية') }
          return send(200, card)
        }
        if (method === 'DELETE') { cards.delete(id); return send(200, { ok: true }) }
      }
      if (type === 'ai' && method === 'POST') {
        const data = await body(req); const doc = docFor(data.documentId)
        // Deliberately simulated: uploaded PDFs are displayed but are never sent to an AI provider.
        if (id === 'flashcards') { const result = makeCards(doc.id); log('جهّزت بطاقات تدريبية'); return send(200, result) }
        if (id === 'quiz') {
          const count = Number(data.count)
          if (!Number.isInteger(count) || count < 3 || count > 10) fail(400, 'اختر بين 3 و10 أسئلة.')
          const questions = concepts.slice(0, count).map((c, index) => {
            const shift = index % 4
            const options = c.options.slice(shift).concat(c.options.slice(0, shift))
            return { id: randomUUID(), text: c.question, options, correct: (4 - shift) % 4, explanation: c.definition }
          })
          const quiz = { id: randomUUID(), documentId: doc.id, title: 'اختبار التعلّم الآلي', createdAt: new Date().toISOString(), questions, result: null }
          quizzes.set(quiz.id, quiz); log('أنشأت اختبارًا من ' + count + ' أسئلة')
          return send(201, publicQuiz(quiz))
        }
        if (id === 'summary') { log('جرّبت تلخيص مستند'); return send(200, { text: '## ملخص تدريبي: مقدمة في التعلّم الآلي\n\n' + concepts.slice(0, 7).map(c => '- **' + c.term + ':** ' + c.definition).join('\n') + '\n\n### الفكرة الأهم\nالهدف هو تعلّم أنماط مفيدة وتقييمها على أمثلة جديدة، وليس حفظ بيانات التدريب.' }) }
        if (id === 'explain' || id === 'chat') {
          const prompt = String(data.prompt || '').trim()
          if (!prompt || prompt.length > 2000) fail(400, 'اكتب سؤالًا من 1 إلى 2000 حرف.')
          const concept = concepts.find(c => prompt.includes(c.term) || prompt.includes(c.term.replace('ال', '')))
          const text = concept
            ? '### ' + concept.term + '\n\n' + concept.definition + '\n\n**مثال:** ' + concept.example + '\n\n**جرّب بنفسك:** اذكر مثالًا آخر من حياتك على هذا المفهوم.'
            : 'هذه إجابة تجريبية عن التعلّم الآلي، وليست تحليلًا لملفك.\n\n' + concepts[0].definition + '\n\nيمكنك تجربة سؤال عن **التصنيف** أو **الانحدار** أو **فرط التعلّم**.'
          if (id === 'chat') {
            const history = chats.get(doc.id) || []
            history.push({ role: 'user', text: prompt }, { role: 'assistant', text })
            chats.set(doc.id, history.slice(-60))
          }
          return send(200, { text })
        }
      }
      if (type === 'chat' && method === 'GET') { docFor(id); return send(200, chats.get(id) || []) }
      if (type === 'quizzes') {
        if (!id && method === 'GET') return send(200, [...quizzes.values()].filter(q => !url.searchParams.has('documentId') || q.documentId === url.searchParams.get('documentId')).map(publicQuiz).reverse())
        const quiz = quizzes.get(id); if (!quiz) fail(404, 'الاختبار غير موجود أو انتهت الجلسة.')
        if (action === 'submit' && method === 'POST') {
          if (quiz.result) return send(200, quiz.result)
          const { answers } = await body(req)
          if (!Array.isArray(answers) || answers.length !== quiz.questions.length || answers.some(a => !Number.isInteger(a) || a < 0 || a > 3)) fail(400, 'أجب عن جميع الأسئلة قبل التسليم.')
          const correctCount = quiz.questions.filter((q, i) => q.correct === answers[i]).length
          quiz.result = { score: Math.round(correctCount / quiz.questions.length * 100), correctCount, total: quiz.questions.length, answers, questions: quiz.questions }
          log('أنهيت اختبارًا بنتيجة ' + quiz.result.score + '%')
          return send(200, quiz.result)
        }
        if (action === 'result' && method === 'GET') { if (!quiz.result) fail(409, 'لم يتم تسليم الاختبار بعد.'); return send(200, quiz.result) }
        if (method === 'GET') return send(200, publicQuiz(quiz))
        if (method === 'DELETE') { quizzes.delete(id); return send(200, { ok: true }) }
      }
      return send(404, { error: 'المسار غير موجود.' })
    } catch (error) { send(error.status || 500, { error: error.status ? error.message : 'حدث خطأ في الخادم المحلي.' }) }
  })
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createDemoServer().listen(3001, '127.0.0.1', () => console.log('Demo API: http://127.0.0.1:3001'))
}
