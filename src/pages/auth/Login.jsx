import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Head from "@/layout/head/Head";
import AuthFooter from "./AuthFooter";
import Logo from "@/layout/logo/Logo";

import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "@/components/Component";
import { Form, Spinner, Alert } from "reactstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [errorVal, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onFormSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      toast.success("Login successful! Welcome back.");
      navigate('/app-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.message || "Invalid email or password. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onInvalidSubmit = (formErrors) => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstError = formErrors[errorKeys[0]];
      if (firstError?.message) {
        toast.warning(firstError.message);
      }
    }
  };

  return (
    <>
      <Head title="Login" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Logo to="/" />
        </div>

        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Sign-In</BlockTitle>
              <BlockDes>
                <p>Access your task management portal using your email and password.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>

          {errorVal && (
            <div className="mb-3">
              <Alert color="danger" className="alert-icon">
                <Icon name="alert-circle" /> {errorVal}
              </Alert>
            </div>
          )}

          <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit, onInvalidSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
              </div>
              <div className="form-control-wrap">
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email address is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="Enter your email address"
                  className={`form-control-lg form-control ${errors.email ? "error" : ""}`}
                />
                {errors.email && <span className="invalid">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="form-control-wrap">
                <a
                  href="#password"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch cursor-pointer ${passState ? "is-hidden" : "is-shown"}`}
                >
                  <Icon name={passState ? "eye" : "eye-off"} className="passcode-icon" />
                </a>
                <input
                  type={passState ? "text" : "password"}
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Enter your password"
                  className={`form-control-lg form-control ${errors.password ? "error" : ""}`}
                />
                {errors.password && <span className="invalid">{errors.password.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary" disabled={loading}>
                {loading ? <Spinner size="sm" color="light" /> : "Sign in"}
              </Button>
            </div>
          </Form>

          <div className="form-note-s2 text-center pt-4">
            New on our platform? <Link to={`/auth-register`}>Create an account</Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default Login;
