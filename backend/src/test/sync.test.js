// backend/src/test/sync.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'

describe('Sync Endpoints', () => {
  let accessToken = ''

  beforeAll(async () => {
    // ✅ ایمیل یکتا برای جلوگیری از تداخل
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `sync-${Date.now()}@example.com`,
        password: 'Test123456',
        name: 'Sync User'
      })
    accessToken = signup.body.accessToken
    expect(accessToken).toBeDefined()
  })

  it('should push changes', async () => {
    const now = new Date().toISOString()
    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        changes: [{
          entity: 'tasks',
          data: {
            // ✅ camelCase
            id: 'test-task-1',
            title: 'Test Task',
            description: '',
            status: 'todo',
            priority: 'medium',
            completed: false,
            // ✅ snake_case (نزد zod backend برای LWW)
            created_at: now,
            updated_at: now
          }
        }]
      })

    // ✅ دیباگ
    if (res.status !== 200) console.log('Push response:', res.status, JSON.stringify(res.body, null, 2))

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(typeof res.body.applied).toBe('number')
  })

  it('should pull changes', async () => {
    const res = await request(app)
      .get('/api/sync/pull')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.entities).toBeDefined()
  })

  it('should full sync (push + pull)', async () => {
    const res = await request(app)
      .post('/api/sync/full')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ changes: [], since: null })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should reset all user data', async () => {
    const res = await request(app)
      .delete('/api/sync/reset')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
  })
})