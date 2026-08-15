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

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [errorVal, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFormSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await login({
        email: formData.name.trim(),
        password: formData.passcode,
      });
      navigate('/app-dashboard');
    } catch (err) {
      setError(err.message || "Unable to login with credentials");
    } finally {
      setLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm();

  return <>
    <Head title="Login" />
    <Block className="nk-block-middle nk-auth-body wide-xs">
      <div className="brand-logo pb-4 text-center">
        <Link to={"/app-dashboard"} className="logo-link" style={{ textDecoration: 'none' }}>
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
            <BlockTitle tag="h4">Sign-In</BlockTitle>
            <BlockDes>
              <p>Access Jagjit Singh portal using your email and passcode.</p>
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
        <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="default-01">
                Email or Username
              </label>
            </div>
            <div className="form-control-wrap">
              <input
                type="text"
                id="default-01"
                {...register('name', { required: "This field is required" })}
                defaultValue="admin@example.com"
                placeholder="Enter your email address or username"
                className="form-control-lg form-control" />
              {errors.name && <span className="invalid">{errors.name.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="password">
                Passcode
              </label>
              {/* <Link className="link link-primary link-sm" to={`/auth-reset`}>
                Forgot Code?
              </Link> */}
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
                {...register('passcode', { required: "This field is required" })}
                defaultValue="Password123!"
                placeholder="Enter your passcode"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
              {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
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
  </>;
};
export default Login;
