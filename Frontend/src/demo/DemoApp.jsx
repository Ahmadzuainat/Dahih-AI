import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, GraduationCap, Layers, LayoutDashboard, Menu, MessageCircle, Plus, Search, Send, Sparkles, Star, Target, Trash2, Upload, UserRound, X, Zap, RotateCcw, ExternalLink, ListChecks } from 'lucide-react'
import Markdown from 'react-markdown'
import toast, { Toaster } from 'react-hot-toast'
import { api, sizeLabel } from './api'
import './demo.css'

function useData(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  useEffect(() => {
    let active = true
    setData(null); setError('')
    api(path).then(value => { if (active) setData(value) }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [path, version])
  return { data, error, reload: () => setVersion(n => n + 1) }
}

function Status({ error, retry }) {
  return <div className="state" role={error ? 'alert' : 'status'}>{error ? <><p>{error}</p><button className="btn secondary" onClick={retry}>إعادة المحاولة</button></> : <><span className="spinner" /><p>لحظة، نجهّز مساحة التعلّم…</p></>}</div>
}
function Empty({ title, text, children }) { return <div className="empty"><BookOpen size={38} /><h3>{title}</h3><p>{text}</p>{children}</div> }
function Heading({ eyebrow, title, text, children }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{text && <p>{text}</p>}</div>{children}</div> }
function DemoNote() { return <div className="demo-note"><Sparkles size={16} /><span>محاكاة تعليمية: الردود والبطاقات والأسئلة عن درس التعلّم الآلي، وليست تحليلًا للملفات المرفوعة.</span></div> }
function Modal({ title, close, children }) {
  const ref = useRef(null)
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close() }, [])
  return <dialog ref={ref} className="modal" onCancel={close} onClick={e => { if (e.target === e.currentTarget) close() }}><div className="modal-inner"><div className="section-heading"><h2>{title}</h2><button className="icon-btn" aria-label="إغلاق" onClick={close}><X /></button></div>{children}</div></dialog>
}
function UploadModal({ close }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  function select(value) {
    if (!value) return
    if (!value.name.toLowerCase().endsWith('.pdf')) return toast.error('اختر ملف PDF فقط.')
    if (value.size > 10 * 1024 * 1024) return toast.error('الحد الأقصى للملف 10 MB.')
    setFile(value)
  }
  async function upload() {
    if (!file || busy) return
    setBusy(true)
    try {
      const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = () => reject(new Error('تعذرت قراءة الملف.')); reader.readAsDataURL(file) })
      const doc = await api('/documents', { method: 'POST', body: { name: file.name, data } })
      toast.success('مستندك جاهز للقراءة'); close(); navigate('/document/' + doc.id)
    } catch (e) { toast.error(e.message) } finally { setBusy(false) }
  }
  return <Modal title="أضف مستندًا جديدًا" close={() => { if (!busy) close() }}><p className="muted">اجمع موادك الدراسية في مكان واحد.</p><label className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); select(e.dataTransfer.files[0]) }}><Upload size={32} /><strong>{file ? file.name : 'اسحب ملفك هنا، أو اضغط لاختياره'}</strong><span>{file ? sizeLabel(file.size) : 'PDF فقط · حتى 10 MB'}</span><input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={e => select(e.target.files[0])} /></label><p className="small muted">الملفات مؤقتة لهذه الجلسة، وتُحذف عند إعادة تشغيل الخادم.</p><button className="btn full" disabled={!file || busy} onClick={upload}><Upload size={18} />{busy ? 'جارٍ رفع المستند…' : 'رفع المستند'}</button></Modal>
}
function DocumentCard({ doc, onDelete }) {
  return <article className="document-card"><div className="card-top"><span className="file-icon"><FileText size={27} /></span><span className="tag">{doc.sample ? 'مستند تجريبي' : 'PDF'}</span></div><Link to={'/document/' + doc.id} className="document-title">{doc.title}</Link><p className="file-name" dir="ltr">{doc.name}</p><div className="document-meta"><span dir="ltr">{sizeLabel(doc.size)}</span><span>{new Date(doc.createdAt).toLocaleDateString('ar-JO', { day: 'numeric', month: 'short' })}</span></div><div className="card-bottom"><Link to={'/document/' + doc.id}>ابدأ الدراسة <ArrowLeft size={16} /></Link>{onDelete && <button className="icon-btn danger" aria-label={'حذف ' + doc.title} onClick={() => onDelete(doc)}><Trash2 size={17} /></button>}</div></article>
}

function Dashboard({ upload }) {
  const { data, error, reload } = useData('/dashboard')
  const profile = useData('/profile')
  if (!data) return <Status error={error} retry={reload} />
  const percent = data.cards ? Math.round(data.reviewed / data.cards * 100) : 0
  return <><Heading eyebrow="مساحتك للتعلّم" title={'أهلًا ' + (profile.data?.name || 'فيك') + '، جاهز لفكرة جديدة؟'} text="كل صفحة تقرأها، خطوة أقرب لفهم أعمق."><button className="btn" onClick={upload}><Plus size={20} />رفع مستند</button></Heading>
    <section className="welcome-panel"><div><span className="eyebrow">تعلّم بطريقتك</span><h2>من صفحات كثيرة،<br />إلى أفكار واضحة.</h2><p>اقرأ، اسأل، واختبر فهمك. أدوات دراستك<br className="desktop-break" /> كلها في مساحة واحدة.</p><Link className="btn dark" to={data.recent.length ? '/document/' + data.recent[0].id : '/document'}>خلّينا نبدأ <ArrowLeft size={18} /></Link></div><div className="study-preview"><div className="preview-label"><Sparkles size={17} />فكرة اليوم <span>01 / 10</span></div><h3>الفهم أهم من الحفظ.</h3><p>بعد كل فكرة جديدة، حاول تشرحها<br />بكلماتك وبمثال من حياتك.</p><div className="preview-foot"><span><CheckCircle2 size={16} />تعلّم نشط</span><span>خطوة بخطوة</span></div></div></section>
    <div className="stats">{[[FileText, 'مستنداتك', data.documents, 'orange'], [Layers, 'بطاقات التعلّم', data.cards, 'purple'], [ListChecks, 'اختباراتك', data.quizzes, 'blue'], [CheckCircle2, 'اختبارات مكتملة', data.completed, 'green']].map(([Icon, label, count, color]) => <div className="stat" key={label}><span className={'stat-icon ' + color}><Icon size={23} /></span><div><p>{label}</p><strong>{count.toLocaleString('ar-JO')}</strong></div></div>)}</div>
    <div className="dashboard-grid"><section><div className="section-heading"><h2>كمّل من آخر صفحة</h2><Link className="text-link" to="/document">كل المستندات <ArrowLeft size={16} /></Link></div>{data.recent.length ? <div className="documents-grid compact">{data.recent.map(doc => <DocumentCard key={doc.id} doc={doc} />)}</div> : <Empty title="أول خطوة تبدأ بمستند" text="ارفع مادة دراسية وابدأ القراءة." />}
    <div className="section-heading spaced"><h2>نشاطك الأخير</h2><Clock3 size={18} /></div><div className="activity-list">{data.activity.slice(0, 4).map(item => <div className="activity" key={item.id}><span className="activity-dot" /><span>{item.title}</span><time>{new Date(item.createdAt).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}</time></div>)}</div></section><aside className="progress-panel"><span className="stat-icon green"><Target size={24} /></span><h2>قليل كل يوم،<br />كثير مع الوقت.</h2><p>راجع بطاقاتك وثبّت الأفكار الجديدة.</p><div className="progress-ring" style={{ '--progress': percent + '%' }}><div><strong>{percent}%</strong><span>من البطاقات</span></div></div><div className="progress-label"><span>تمت مراجعتها</span><b>{data.reviewed} / {data.cards}</b></div><Link className="btn secondary full" to="/flashcards">راجع بطاقاتك <ArrowLeft size={16} /></Link></aside></div></>
}
function Documents({ upload }) {
  const { data, error, reload } = useData('/documents')
  const [query, setQuery] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  async function remove() { setBusy(true); try { await api('/documents/' + deleting.id, { method: 'DELETE' }); toast.success('تم حذف المستند'); setDeleting(null); reload() } catch (e) { toast.error(e.message) } finally { setBusy(false) } }
  return <><Heading eyebrow="مكتبتك الشخصية" title="مستنداتك، بداية كل فكرة." text="رتّب موادك وارجع لها وقت ما تحتاج."><button className="btn" onClick={upload}><Plus size={19} />رفع مستند</button></Heading><div className="toolbar"><label className="search"><Search size={19} /><input aria-label="ابحث في المستندات" placeholder="ابحث عن مستند…" value={query} onChange={e => setQuery(e.target.value)} /></label><span className="muted">{data?.length || 0} مستندات</span></div>{!data ? <Status error={error} retry={reload} /> : data.filter(d => d.title.toLowerCase().includes(query.toLowerCase())).length ? <div className="documents-grid">{data.filter(d => d.title.toLowerCase().includes(query.toLowerCase())).map(doc => <DocumentCard key={doc.id} doc={doc} onDelete={setDeleting} />)}</div> : <Empty title={query ? 'ما لقينا مستند بهذا الاسم' : 'مكتبتك بانتظار أول مستند'} text={query ? 'جرّب كلمة ثانية.' : 'ارفع ملف PDF لتبدأ.'}><button className="btn secondary" onClick={query ? () => setQuery('') : upload}>{query ? 'مسح البحث' : 'رفع مستند'}</button></Empty>}{deleting && <Modal title="حذف المستند؟" close={() => { if (!busy) setDeleting(null) }}><p>سيتم حذف «{deleting.title}» وبطاقاته واختباراته من هذه الجلسة.</p><div className="button-row"><button className="btn danger-fill" disabled={busy} onClick={remove}>{busy ? 'جارٍ الحذف…' : 'حذف المستند'}</button><button className="btn secondary" disabled={busy} onClick={() => setDeleting(null)}>إلغاء</button></div></Modal>}</>
}

function Chat({ documentId }) {
  const { data, error, reload } = useData('/chat/' + documentId)
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const bottom = useRef(null)
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [data])
  async function send(e) { e.preventDefault(); if (!prompt.trim() || busy) return; setBusy(true); try { await api('/ai/chat', { method: 'POST', body: { documentId, prompt } }); setPrompt(''); reload() } catch (err) { toast.error(err.message) } finally { setBusy(false) } }
  return <div className="chat"><DemoNote /><div className="chat-messages">{!data ? <Status error={error} retry={reload} /> : data.length ? data.map((m, i) => <div key={i} className={'message ' + m.role}><span className="message-avatar">{m.role === 'assistant' ? <Sparkles size={17} /> : <UserRound size={17} />}</span><div className="markdown"><Markdown>{m.text}</Markdown></div></div>) : <div className="chat-welcome"><span className="ai-orb"><Sparkles size={30} /></span><h2>السؤال بداية الفهم.</h2><p>جرّب سؤالًا من الدرس التجريبي.</p>{['اشرح التصنيف بمثال', 'ما المقصود بفرط التعلّم؟', 'اشرح الانحدار ببساطة'].map(q => <button className="suggestion" key={q} onClick={() => setPrompt(q)}>{q}<ArrowLeft size={16} /></button>)}</div>}<div ref={bottom} /></div><form onSubmit={send} className="chat-input"><input aria-label="سؤالك" placeholder="شو حاب تفهم اليوم؟" value={prompt} maxLength={2000} disabled={busy} onChange={e => setPrompt(e.target.value)} /><button className="btn" disabled={busy || !prompt.trim()} aria-label="إرسال السؤال">{busy ? <span className="spinner small-spinner" /> : <Send size={19} />}</button></form></div>
}
function Actions({ documentId }) {
  const [text, setText] = useState('')
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState('')
  async function generate(action) { setBusy(action); try { const result = await api('/ai/' + action, { method: 'POST', body: { documentId, prompt } }); setText(result.text); toast.success('المحتوى التجريبي جاهز') } catch (e) { toast.error(e.message) } finally { setBusy('') } }
  return <div className="tool-panel"><DemoNote /><div className="action-card"><span className="stat-icon orange"><FileText /></span><h3>الأفكار الأساسية، في مكان واحد.</h3><p>جرّب ملخصًا مرتبًا للدرس التجريبي.</p><button className="btn" disabled={!!busy} onClick={() => generate('summary')}><Sparkles size={17} />{busy === 'summary' ? 'جارٍ التجهيز…' : 'إنشاء ملخص'}</button></div><form className="action-card" onSubmit={e => { e.preventDefault(); generate('explain') }}><h3>في مفهوم يحتاج توضيح؟</h3><label htmlFor="concept">اكتب المفهوم</label><input id="concept" placeholder="مثل: فرط التعلّم" required maxLength={2000} value={prompt} onChange={e => setPrompt(e.target.value)} /><button className="btn secondary" disabled={!!busy || !prompt.trim()}>{busy === 'explain' ? 'جارٍ التجهيز…' : 'اشرح لي المفهوم'}<ArrowLeft size={17} /></button></form>{text && <article className="markdown generated"><Markdown>{text}</Markdown></article>}</div>
}
function CardViewer({ cards, update }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy] = useState(false)
  const card = cards[Math.min(index, cards.length - 1)]
  async function patch(body) { setBusy(true); try { const value = await api('/cards/' + card.id, { method: 'PATCH', body }); update(value) } catch (e) { toast.error(e.message) } finally { setBusy(false) } }
  if (!card) return <Empty title="لا توجد بطاقات هنا بعد" text="أنشئ بطاقات من صفحة أحد المستندات." />
  function move(n) { setIndex(i => (i + n + cards.length) % cards.length); setFlipped(false) }
  return <div className="card-viewer"><div className="section-heading"><span className="muted">بطاقة {Math.min(index + 1, cards.length)} من {cards.length}</span><button className={'icon-btn favorite ' + (card.favorite ? 'selected' : '')} aria-label={card.favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'} aria-pressed={card.favorite} disabled={busy} onClick={() => patch({ favorite: !card.favorite })}><Star size={21} fill={card.favorite ? 'currentColor' : 'none'} /></button></div><button className={'flip-card ' + (flipped ? 'flipped' : '')} onClick={() => setFlipped(v => !v)} aria-label={flipped ? 'عرض السؤال' : 'اقلب البطاقة لعرض الإجابة'}><span className="flip-inner"><span className="card-face front" aria-hidden={flipped}><span className="eyebrow">فكّر قبل ما تقلب</span><strong>{card.question}</strong><span className="flip-hint"><RotateCcw size={16} />اضغط لإظهار الإجابة</span></span><span className="card-face back" aria-hidden={!flipped}><span className="eyebrow">الفكرة ببساطة</span><strong>{card.answer}</strong><span>{card.example}</span></span></span></button><div className="flash-controls"><button className="icon-btn bordered" aria-label="البطاقة السابقة" onClick={() => move(-1)}><ChevronRight /></button><button className={'btn ' + (card.reviewed ? 'secondary' : '')} disabled={busy || card.reviewed} onClick={() => patch({ reviewed: true })}><Check size={18} />{card.reviewed ? 'تمت مراجعتها' : 'فهمتها، تمت المراجعة'}</button><button className="icon-btn bordered" aria-label="البطاقة التالية" onClick={() => move(1)}><ChevronLeft /></button></div></div>
}
function Flashcards({ documentId, favoritesOnly = false }) {
  const { data, error, reload } = useData('/cards' + (documentId ? '?documentId=' + documentId : ''))
  const [local, setLocal] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setLocal(data) }, [data])
  async function generate() { setBusy(true); try { await api('/ai/flashcards', { method: 'POST', body: { documentId } }); reload(); toast.success('البطاقات التجريبية جاهزة') } catch (e) { toast.error(e.message) } finally { setBusy(false) } }
  const shown = local?.filter(c => !favoritesOnly || c.favorite)
  return <>{!documentId && <Heading eyebrow="ثبّت المعلومة" title={favoritesOnly ? 'أفكار تستحق ترجع لها.' : 'بطاقة صغيرة، فهم كبير.'} text="فكّر بالإجابة، اقلب البطاقة، ثم سجّل مراجعتك." />}<DemoNote />{!local ? <Status error={error} retry={reload} /> : shown.length ? <CardViewer key={documentId || String(favoritesOnly)} cards={shown} update={card => setLocal(items => items.map(c => c.id === card.id ? card : c))} /> : <Empty title={favoritesOnly ? 'مفضلتك لسه فاضية' : 'جهّز أول مجموعة بطاقات'} text={favoritesOnly ? 'اضغط النجمة على أي بطاقة لتحفظها هنا.' : 'ست بطاقات تجريبية تساعدك تختبر فهمك.'}>{documentId ? <button className="btn" disabled={busy} onClick={generate}><Sparkles size={18} />{busy ? 'جارٍ التجهيز…' : 'إنشاء بطاقات تجريبية'}</button> : <Link className="btn secondary" to={favoritesOnly ? '/flashcards' : '/document'}>{favoritesOnly ? 'تصفّح البطاقات' : 'اذهب للمستندات'}</Link>}</Empty>}</>
}
function Quizzes({ documentId }) {
  const { data, error, reload } = useData('/quizzes' + (documentId ? '?documentId=' + documentId : ''))
  const [count, setCount] = useState(5)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function generate() { setBusy(true); try { const quiz = await api('/ai/quiz', { method: 'POST', body: { documentId, count } }); navigate('/quizzes/' + quiz.id) } catch (e) { toast.error(e.message) } finally { setBusy(false) } }
  async function remove(id) { if (!window.confirm('حذف هذا الاختبار ونتيجته؟')) return; try { await api('/quizzes/' + id, { method: 'DELETE' }); reload(); toast.success('تم حذف الاختبار') } catch (e) { toast.error(e.message) } }
  return <>{!documentId && <Heading eyebrow="اختبر فهمك" title="مش بس تقرأ، تأكّد إنك فهمت." text="اختبارات قصيرة، وإجابات تشرح لك الفكرة." />}<DemoNote />{documentId && <div className="quiz-generator"><div><h3>تحدٍّ صغير لفهم أعمق</h3><p className="muted">أسئلة اختيار متعدد من الدرس التجريبي.</p></div><label>عدد الأسئلة<select value={count} onChange={e => setCount(Number(e.target.value))}>{[3, 5, 7, 10].map(n => <option key={n}>{n}</option>)}</select></label><button className="btn" disabled={busy} onClick={generate}><Sparkles size={17} />{busy ? 'جارٍ التجهيز…' : 'إنشاء اختبار'}</button></div>}{!data ? <Status error={error} retry={reload} /> : !data.length ? <Empty title="اختبارك الأول بانتظارك" text="أنشئ اختبارًا من صفحة المستند وابدأ التحدّي.">{!documentId && <Link className="btn secondary" to="/document">اختيار مستند</Link>}</Empty> : <div className="quiz-list">{data.map(q => <article className="quiz-row" key={q.id}><span className="stat-icon blue"><ListChecks /></span><div><h3>{q.title}</h3><p>{q.questions.length} أسئلة · {q.result ? 'مكتمل' : 'جاهز للبدء'}</p></div>{q.result && <b className="score-pill">{q.result.score}%</b>}<Link className="btn secondary" to={'/quizzes/' + q.id + (q.result ? '/result' : '')}>{q.result ? 'النتيجة' : 'ابدأ'}<ArrowLeft size={16} /></Link><button className="icon-btn danger" aria-label="حذف الاختبار" onClick={() => remove(q.id)}><Trash2 size={17} /></button></article>)}</div>}</>
}
function DocumentDetails() {
  const { id } = useParams()
  const { data, error, reload } = useData('/documents/' + id)
  const [tab, setTab] = useState('chat')
  if (!data) return <Status error={error} retry={reload} />
  const tabs = [['chat', MessageCircle, 'اسأل دحيح'], ['actions', Sparkles, 'أدوات الفهم'], ['cards', Layers, 'البطاقات'], ['quizzes', ListChecks, 'الاختبارات']]
  return <><Link className="back-link" to="/document"><ArrowRight size={17} />كل المستندات</Link><Heading eyebrow="جلسة دراسة" title={data.title} text={data.name + ' · ' + sizeLabel(data.size)} /><div className="workspace"><section className="pdf-panel"><div className="pdf-toolbar"><span><FileText size={17} />المستند</span><a href={'/api/documents/' + id + '/file'} target="_blank" rel="noreferrer" aria-label="فتح PDF في تبويب جديد"><ExternalLink size={17} /></a></div><iframe title={'قارئ PDF: ' + data.title} src={'/api/documents/' + id + '/file#toolbar=1'} /><p className="pdf-fallback">إذا لم يظهر الملف، <a href={'/api/documents/' + id + '/file'} target="_blank" rel="noreferrer">افتحه في تبويب جديد</a>.</p></section><section className="learning-panel"><div className="tabs" role="tablist" aria-label="أدوات الدراسة">{tabs.map(([key, Icon, label]) => <button key={key} id={'tab-' + key} role="tab" aria-selected={tab === key} aria-controls="study-panel" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon size={17} />{label}</button>)}</div><div role="tabpanel" id="study-panel" aria-labelledby={'tab-' + tab}>{tab === 'chat' ? <Chat key={id} documentId={id} /> : tab === 'actions' ? <Actions key={id} documentId={id} /> : tab === 'cards' ? <Flashcards key={id} documentId={id} /> : <Quizzes key={id} documentId={id} />}</div></section></div></>
}
function QuizTake() {
  const { id } = useParams()
  const { data, error, reload } = useData('/quizzes/' + id)
  const [answers, setAnswers] = useState({})
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  async function submit(e) { e.preventDefault(); setBusy(true); try { await api('/quizzes/' + id + '/submit', { method: 'POST', body: { answers: data.questions.map(q => answers[q.id]) } }); navigate('/quizzes/' + id + '/result') } catch (err) { toast.error(err.message) } finally { setBusy(false) } }
  if (!data) return <Status error={error} retry={reload} />
  if (data.result) return <Navigate to={'/quizzes/' + id + '/result'} replace />
  const answered = data.questions.filter(q => answers[q.id] !== undefined).length
  return <div className="narrow"><Link className="back-link" to={'/document/' + data.documentId}><ArrowRight size={17} />العودة للمستند</Link><Heading eyebrow="وقت التحدّي" title={data.title} text="خذ وقتك. كل سؤال فرصة تثبّت فيها فكرة." /><DemoNote /><div className="quiz-progress"><span>أجبت عن {answered} من {data.questions.length}</span><progress value={answered} max={data.questions.length} /></div><form onSubmit={submit}>{data.questions.map((q, index) => <fieldset className="question-card" key={q.id}><legend><span>{String(index + 1).padStart(2, '0')}</span>{q.text}</legend><div className="options">{q.options.map((option, i) => <label className={'option ' + (answers[q.id] === i ? 'chosen' : '')} key={i}><input type="radio" name={q.id} value={i} checked={answers[q.id] === i} onChange={() => setAnswers(a => ({ ...a, [q.id]: i }))} required /><span>{option}</span></label>)}</div></fieldset>)}<button className="btn full" disabled={busy || answered !== data.questions.length}>{busy ? 'جارٍ التصحيح…' : 'سلّم الإجابات وشوف النتيجة'}<ArrowLeft size={18} /></button></form></div>
}
function QuizResult() {
  const { id } = useParams()
  const { data, error, reload } = useData('/quizzes/' + id + '/result')
  if (!data) return <><Link className="back-link" to={'/quizzes/' + id}><ArrowRight size={17} />العودة للاختبار</Link><Status error={error} retry={reload} /></>
  return <div className="narrow"><div className="result-hero"><span className="stat-icon green"><GraduationCap size={30} /></span><span className="eyebrow">كل تجربة بتعلّمك إشي جديد</span><h1>{data.score >= 70 ? 'ممتاز، الأفكار صارت أوضح!' : 'بداية حلوة، نراجع ونكمل.'}</h1><strong className="result-score">{data.score}<span>%</span></strong><p>{data.correctCount} إجابات صحيحة من {data.total}</p><Link className="btn secondary" to="/quizzes">كل الاختبارات <ArrowLeft size={17} /></Link></div><h2 className="spaced">خلّينا نراجع الإجابات</h2>{data.questions.map((q, index) => <article key={q.id} className="answer-card"><div className="section-heading"><h3>{index + 1}. {q.text}</h3><span className={'tag ' + (data.answers[index] === q.correct ? 'success' : 'incorrect')}>{data.answers[index] === q.correct ? 'صحيحة' : 'تحتاج مراجعة'}</span></div><p className={data.answers[index] === q.correct ? 'correct-text' : 'wrong-text'}>إجابتك: {q.options[data.answers[index]]}</p>{data.answers[index] !== q.correct && <p className="correct-text">الإجابة الصحيحة: {q.options[q.correct]}</p>}<div className="explanation"><Sparkles size={17} /><p>{q.explanation}</p></div></article>)}</div>
}
function Profile() {
  const { data, error, reload } = useData('/profile')
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (data) { setName(data.name); setGoal(data.goal) } }, [data])
  async function save(e) { e.preventDefault(); setBusy(true); try { await api('/profile', { method: 'PATCH', body: { name, goal } }); toast.success('تم حفظ ملفك لهذه الجلسة') } catch (err) { toast.error(err.message) } finally { setBusy(false) } }
  return <><Heading eyebrow="مساحتك الخاصة" title="خلّي التعلّم يشبهك." text="تفاصيل بسيطة، وخطوة نحو هدفك." />{!data ? <Status error={error} retry={reload} /> : <form className="profile-card" onSubmit={save}><span className="profile-avatar">{name.slice(0, 1) || 'د'}</span><h2>ملفك التجريبي</h2><p className="muted">بدون حساب أو كلمة مرور. التعديلات محفوظة لهذه الجلسة فقط.</p><label htmlFor="name">اسمك</label><input id="name" required maxLength={60} value={name} onChange={e => setName(e.target.value)} /><label htmlFor="goal">هدفك الدراسي</label><textarea id="goal" maxLength={180} rows={3} value={goal} onChange={e => setGoal(e.target.value)} /><button className="btn" disabled={busy || !name.trim()}>{busy ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}<Check size={18} /></button></form>}</>
}
function Shell() {
  const [upload, setUpload] = useState(false)
  const [menu, setMenu] = useState(false)
  const location = useLocation()
  useEffect(() => { setMenu(false); window.scrollTo(0, 0) }, [location.pathname])
  const links = [[LayoutDashboard, '/dashboard', 'نظرة عامة'], [FileText, '/document', 'مستنداتي'], [Layers, '/flashcards', 'بطاقات التعلّم'], [ListChecks, '/quizzes', 'الاختبارات'], [Star, '/favorites', 'المفضلة']]
  return <div className="demo-app" dir="rtl"><a href="#main-content" className="skip-link">انتقل للمحتوى</a>{menu && <button className="sidebar-shade" aria-label="إغلاق القائمة" onClick={() => setMenu(false)} />}<aside className={'sidebar ' + (menu ? 'open' : '')}><Link to="/dashboard" className="brand"><span className="brand-mark"><GraduationCap size={30} /></span><span>دحيح<span className="brand-ai">AI</span><small>افهم أكثر. تعلّم أذكى.</small></span></Link><span className="nav-caption">مساحة التعلّم</span><nav aria-label="القائمة الرئيسية">{links.map(([Icon, path, label]) => <NavLink key={path} to={path}><Icon size={20} /><span>{label}</span><ChevronLeft className="nav-chevron" size={15} /></NavLink>)}</nav><div className="sidebar-tip"><span className="stat-icon orange"><Zap size={21} /></span><h3>الفكرة بتبدأ بسؤال.</h3><p>جرّب أدوات دحيح على المستند الجاهز، أو ارفع مستندك.</p><button onClick={() => setUpload(true)}>أضف مستندًا <Plus size={17} /></button></div><NavLink className="profile-link" to="/profile"><span className="mini-avatar"><UserRound size={21} /></span><span>ملفي الشخصي<small>جلسة تجريبية مفتوحة</small></span><ChevronLeft size={17} /></NavLink></aside><div className="main-shell"><header className="topbar"><div className="topbar-title"><button className="icon-btn mobile-menu" aria-label="فتح القائمة" onClick={() => setMenu(true)}><Menu /></button><span>مساحة الدراسة <span className="divider">/</span> <b>دحيح AI</b></span></div><span className="demo-badge"><i />نسخة تجريبية مفتوحة</span></header><main id="main-content" className={'content ' + (location.pathname.startsWith('/document/') ? 'detail-content' : '')}><Routes><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard upload={() => setUpload(true)} />} /><Route path="/document" element={<Documents upload={() => setUpload(true)} />} /><Route path="/document/:id" element={<DocumentDetails key={location.pathname} />} /><Route path="/flashcards" element={<Flashcards />} /><Route path="/flashcards/:id" element={<FlashcardRoute />} /><Route path="/favorites" element={<Flashcards favoritesOnly />} /><Route path="/quizzes" element={<Quizzes />} /><Route path="/quizzes/:id" element={<QuizTake key={location.pathname} />} /><Route path="/quizzes/:id/result" element={<QuizResult />} /><Route path="/profile" element={<Profile />} /><Route path="/login" element={<Navigate to="/dashboard" replace />} /><Route path="/register" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<Empty title="404 — هذه الصفحة مش موجودة" text="نرجع لمساحة التعلّم؟"><Link className="btn" to="/dashboard">العودة للرئيسية</Link></Empty>} /></Routes></main><footer className="app-footer"><span>صُنع للفضول، ولحظة «آه، فهمت!»</span><span>بيانات مؤقتة · ذكاء اصطناعي محاكى</span></footer></div>{upload && <UploadModal close={() => setUpload(false)} />}<Toaster position="bottom-center" toastOptions={{ style: { fontFamily: 'inherit', direction: 'rtl' } }} /></div>
}
function FlashcardRoute() { const { id } = useParams(); return <Flashcards documentId={id} /> }
export default function DemoApp() { return <BrowserRouter><Shell /></BrowserRouter> }
