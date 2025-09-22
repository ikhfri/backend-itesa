import express, { Application } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/swagger.json";
import dotenv from "dotenv";
import { prisma } from "./utils/prisma";
import authRoutes from "./routes/auth.routes";
import workerRoutes from "./routes/worker.routes";
import serviceRoutes from "./routes/service.routes";
import orderRoutes from "./routes/order.routes";
import locationRoutes from "./routes/location.routes";

dotenv.config();

const app: Application = express();
app.use(express.json());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { email: profile.emails![0].value },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails![0].value,
              role: "CLIENT",
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Serabutan API! Visit /api-docs for documentation.",
  });
});

app.use("/auth", authRoutes);
app.use("/worker", workerRoutes);
app.use("/service", serviceRoutes);
app.use("/order", orderRoutes);
app.use("/location", locationRoutes);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
