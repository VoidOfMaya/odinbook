import request from "supertest";
import { app } from "./app.js";


describe('check server health',()=>{
    test('checks server health endpoint', async()=>{
        const response =await request(app).get('/health')
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ status: 'ok' })

    })
})
