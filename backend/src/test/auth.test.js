// backend/src/test/auth.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../server.js'
import { run } from '../db/index.js'
import fs from 'fs'
import path from 'path'

beforeAll(async () => {
  // ✅ اجرای schema روی DB تست
  const schemaPath = path.resolve('./src/db/schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  // اینجا می‌تونیم از migrate استفاده کنیم
  const { default: migrate } = await import('../db/migrate.js')
  // migrate خودش schema رو اجرا می‌کنه
})

describe('Auth Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test123456',
    name: 'Test User'
  }

  let accessToken = ''
  let refreshToken = ''

  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    expect(res.body.user.email).toBe(testUser.email)

    accessToken = res.body.accessToken
    refreshToken = res.body.refreshToken
  })

  it('should not signup with duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser)

    expect(res.status).toBe(409)
  })

  it('should signin existing user', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
  })

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: testUser.email, password: 'WrongPass' })

    expect(res.status).toBe(401)
  })

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(testUser.email)
  })

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})