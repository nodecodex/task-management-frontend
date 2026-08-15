import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Head from "@/layout/head/Head";
import AuthFooter from "./AuthFooter";
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
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [passState, setPassState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorVal, setError] = useState("");
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.passcode,
      });
      navigate(`/auth-success`);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return <>
    <Head title="Register" />
    <Block className="nk-block-middle nk-auth-body wide-xs">
      <div className="brand-logo pb-4 text-center">
        <Link to="/app-dashboard" className="logo-link" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px',
              background: '#6576ff', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(101,118,255,0.35)',
            }}>
              <span style={{ color: '#fff', fontWeight: '800', fontSize: '16px', fontFamily: 'inherit' }}>JS</span>
            </div>
            <span style={{ fontWeight: '700', fontSize: '20px', color: '#364a63', fontFamily: 'inherit' }}>Jagjit Singh</span>
          </div>
        </Link>
      </div>
      <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
        <BlockHead>
          <BlockContent>
            <BlockTitle tag="h4">Register</BlockTitle>
            <BlockDes>
              <p>Create New Jagjit Singh Account</p>
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
        <Form className="is-alter" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <div className="form-control-wrap">
              <input
                type="text"
                id="name"
                {...registerForm('name', { required: "Name is required" })}
                placeholder="Enter your name"
                className="form-control-lg form-control" />
              {errors.name && <span className="invalid">{errors.name.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="default-01">
                Email or Username
              </label>
            </div>
            <div className="form-control-wrap">
              <input
                type="email"
                id="default-01"
                {...registerForm('email', {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="form-control-lg form-control"
                placeholder="Enter your email address" />
              {errors.email && <span className="invalid">{errors.email.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="password">
                Passcode
              </label>
            </div>
            <div className="form-control-wrap">
              <a
                href="#password"
                onClick={(ev) => {
                  ev.preventDefault();
                  setPassState(!passState);
                }}
                className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
              >
                <Icon name={passState ? "eye" : "eye-off"} className="passcode-icon" />
              </a>
              <input
                type={passState ? "text" : "password"}
                id="password"
                {...registerForm('passcode', {
                  required: "Passcode is required",
                  minLength: {
                    value: 6,
                    message: "Passcode must be at least 6 characters",
                  },
                })}
                placeholder="Enter your passcode"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
              {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <Button type="submit" color="primary" size="lg" className="btn-block" disabled={loading}>
              {loading ? <Spinner size="sm" color="light" /> : "Register"}
            </Button>
          </div>
        </Form>
        <div className="form-note-s2 text-center pt-4">
          {" "}
          Already have an account?{" "}
          <Link to={`/auth-login`}>
            <strong>Sign in instead</strong>
          </Link>
        </div>
      </PreviewCard>
    </Block>
    <AuthFooter />
  </>;
};
export default Register;
