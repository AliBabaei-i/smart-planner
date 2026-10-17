// backend/src/test/sync.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'

describe('Sync Endpoints', () => {
  let accessToken = ''

  beforeAll(async () => {
    // ✅ ساخت یوزر تست
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'sync-test@example.com',
        password: 'Test123456',
        name: 'Sync User'
      })
    accessToken = signup.body.accessToken
  })

  it('should push changes', async () => {
    const res = await request(app)
      .post('/api/sync/push')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        changes: [{
          entity: 'tasks',
          data: {
            id: 'test-task-1',
            title: 'Test Task',
            status: 'todo',
            updatedAt: new Date().toISOString()
          }
        }]
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.applied).toBe(1)
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
    expect(res.body.push).toBeDefined()
    expect(res.body.pull).toBeDefined()
  })

  it('should reset all user data', async () => {
    const res = await request(app)
      .delete('/api/sync/reset')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
  })
})