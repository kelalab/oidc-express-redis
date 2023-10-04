import express from 'express';
import session from 'express-session';
import {createClient} from 'redis';
import RedisStore from 'connect-redis';
import Auth from 'express-openid-connect';

const {auth, requiresAuth} = Auth;

const client = createClient()
client.connect().catch(console.error);

const app = express();

let redisStore = new RedisStore({
    client: client,
    prefix: "myapp:"
})

app.use(session({
    store: redisStore,
    secret: "littledog",
    resave: false,
    saveUninitialized: false
}))

app.use(
    auth({
        issuerBaseURL: 'http://localhost:8080/realms/test',
        baseURL: 'http://localhost:4000/',
        clientID: 'myapp',
        clientSecret: 'KWdvSPqgTWmkOPjcu4B2LRH9iUThm2Nt',
        secret: 'sassylildoggie',
        idpLogout: true,
        authRequired: false
    })
)

declare module "express-session" {
    interface SessionData {
        count?: number
    }
}

app.get('/', (req, res) => {
    res.redirect('/hello')
})

app.get('/hello', (req,res) => {
    req.session.count += 1
    let requests = req.session.count || 0;
    console.log('req.oidc.user.name', req.oidc.user)
    res.send({"req.count": requests, "user": req.oidc?.user?.preferred_username})
})

app.post('/login', requiresAuth(), (req,res) => {
    res.send({"login": `success ${req.oidc.user.name}`})
})

app.listen(4000, () => {
    console.log('listening at 4000')
})