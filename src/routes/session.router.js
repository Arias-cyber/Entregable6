import { Router } from "express";
import userModel from "../dao/mongo/models/user.js";
import passport from "passport";
const router = Router();

router.get("/github", passport.authenticate("github"), async (req, res) => {});
router.get(
  "/githubcallback",
  passport.authenticate("github"),
  async (req, res) => {
    req.session.user = {
      name: req.user.first_name + " " + req.user.last_name,
      email: req.user.email,
      rol: req.user.email === "adminCoder@coder.com" ? "admin" : "user",
    };
    res.redirect("/products");
  }
);
router.post('/register',(req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: "error", error: err });
    }
    if (!user) {
      return res.status(400).json({ status: "error", error: info.message });
    }
    res.json({ status: "success", payload: user });
  })(req, res, next);
});

router.post('/login',(req, res, next)=>{
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return res.status(500).json({ status: "error", error: err });
    }
    if (!user) {
      return res.status(400).json({ status: "error", error: info.message });
    }
    // Si la autenticación es exitosa, crea la sesión
    req.session.user = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      rol: user.email === "adminCoder@coder.com" ? "admin" : "user",
    };
    res.json({ status: "success" });
  })(req, res, next);
});
router.post('/logout', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ status: "Error", error });
      }
      res.json({ status: "Success", message: "Logout successful" });
    });
  });
export default router;