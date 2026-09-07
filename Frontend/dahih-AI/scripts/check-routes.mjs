import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement as h } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { AppRoutes } = await server.ssrLoadModule('/src/App.jsx')
  const { AuthContext } = await server.ssrLoadModule('/src/context/auth.js')
  function render(path, user = null, loading = false) {
    return renderToString(h(AuthContext.Provider, { value: { user, loading, logout() {} } },
      h(MemoryRouter, { initialEntries: [path] }, h(AppRoutes))))
  }
  const privateRoutes = [
    ['/dashboard', 'Dashboradpage'],
    ['/document', 'DocumentlistPage'],
    ['/document/example', 'DocumentDetailsPage'],
    ['/profile', 'profilePage'],
    ['/flashcards', 'FlashcardsListPag'],
    ['/flashcards/example', 'FlashcardsPage'],
    ['/quizzes/example', 'QuizTakePage'],
    ['/quizzes/example/result', 'QuizResultPage'],
  ]
  for (const [path, page] of privateRoutes) {
    assert.ok(render(path, { id: 'test-user' }).includes(page), `${path} renders its page`)
    assert.equal(render(path), '', `${path} does not expose private content to guests`)
  }
  assert.ok(render('/login').includes('تسجيل الدخول'))
  assert.ok(render('/register').includes('إنشاء حساب'))
  assert.ok(render('/missing').includes('404'))
  assert.ok(render('/dashboard', null, true).includes('Loading...'))
  assert.equal(render('/login', { id: 'test-user' }), '')
  console.log('Passed: all 8 private routes, guest protection, public pages, 404 and loading state.')
} finally {
  await server.close()
}
