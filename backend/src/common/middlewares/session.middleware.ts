import { Injectable, NestMiddleware } from '@nestjs/common'
import { TypeormStore } from 'connect-typeorm'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import session from 'express-session'
import { DataSource } from 'typeorm'

import { ConfigService } from 'core/providers'
import { Session } from 'database/entities'

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly middleware: RequestHandler

  constructor(private config: ConfigService, private dataSource: DataSource) {
    const sessionRepository = dataSource.getRepository(Session)

    this.middleware = session({
      resave: false,
      saveUninitialized: true, // set to true to deterministically generate state for oauth
      secret: this.config.get('session.secret'),
      name: this.config.get('session.name'),
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: this.config.get('session.cookie.maxAge'),
        secure: !config.isDevEnv, // disable in local dev env
      },
      store: new TypeormStore({
        // for every new session, remove this many expired ones. Defaults to 0
        cleanupLimit: 2,
      }).connect(sessionRepository),
    })
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next)
  }
}
