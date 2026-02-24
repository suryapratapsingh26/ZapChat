import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, Zap } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// Step 1: Send Password Reset OTP
	const handleSendOtp = async (e) => {
		e.preventDefault();
		if (!email.trim()) return toast.error("Email is required");
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/send-password-reset-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			if (res.ok) {
				setStep(2);
				toast.success("OTP sent to your email!");
			} else {
				const error = await res.json();
				toast.error(error.error || "Failed to send OTP");
			}
		} catch {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Step 2: Verify OTP
	const handleVerifyOtp = async (e) => {
		e.preventDefault();
		if (otp.length !== 6) return toast.error("Enter a 6-digit OTP");
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/verify-password-reset-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp }),
			});

			if (res.ok) {
				setStep(3);
				toast.success("OTP verified successfully!");
			} else {
				const error = await res.json();
				toast.error(error.error || "Invalid OTP");
			}
		} catch {
			toast.error("Verification failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Step 3: Reset Password
	const handleResetPassword = async (e) => {
		e.preventDefault();
		if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp, newPassword }),
			});

			if (res.ok) {
				toast.success("Password reset successfully! Please log in.");
				navigate("/login");
			} else {
				const error = await res.json();
				toast.error(error.error || "Failed to reset password");
			}
		} catch {
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const getTitle = () => {
		if (step === 1) return "Forgot Password";
		if (step === 2) return "Verify OTP";
		return "Reset Password";
	};
	const getSubtitle = () => {
		if (step === 1) return "We’ll send a code to your email";
		if (step === 2) return `Enter the 6-digit code sent to ${email}`;
		return "Set a new password for your account";
	};

	return (
		<div className='min-h-screen flex justify-center items-center p-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='text-center mb-8'>
					<div className='flex flex-col items-center gap-2 group'>
						<div className='size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
							<Zap className='size-6 text-primary' />
						</div>
						<h1 className='text-2xl font-bold mt-2'>{getTitle()}</h1>
						<p className='text-base-content/60'>{getSubtitle()}</p>
					</div>
				</div>

				{step === 1 && (
					<form onSubmit={handleSendOtp} className='space-y-6'>
						<div className='form-control'>
							<label className='label'>
								<span className='label-text font-medium'>Email</span>
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='size-5 text-base-content/40' />
								</div>
								<input
									type='email'
									className='input input-bordered w-full pl-10'
									placeholder='you@example.com'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
						</div>
						<button type='submit' className='btn btn-primary w-full' disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className='size-5 animate-spin' />
									Sending OTP...
								</>
							) : (
								"Send OTP"
							)}
						</button>
					</form>
				)}

				{step === 2 && (
					<form onSubmit={handleVerifyOtp} className='space-y-6'>
						<div className='form-control'>
							<label className='label'>
								<span className='label-text font-medium'>Verification Code</span>
							</label>
							<input
								type='text'
								className='input input-bordered w-full text-center tracking-widest'
								placeholder='123456'
								maxLength={6}
								value={otp}
								onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							/>
						</div>
						<button type='submit' className='btn btn-primary w-full' disabled={isLoading}>
							{isLoading ? <Loader2 className='size-5 animate-spin' /> : "Verify OTP"}
						</button>
					</form>
				)}

				{step === 3 && (
					<form onSubmit={handleResetPassword} className='space-y-6'>
						<div className='form-control'>
							<label className='label'>
								<span className='label-text font-medium'>New Password</span>
							</label>
							<div className='relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='size-5 text-base-content/40' />
								</div>
								<input
									type={showPassword ? "text" : "password"}
									className='input input-bordered w-full pl-10'
									placeholder='••••••••'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
								<button
									type='button'
									className='absolute inset-y-0 right-0 pr-3 flex items-center'
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className='size-5 text-base-content/40' />
									) : (
										<Eye className='size-5 text-base-content/40' />
									)}
								</button>
							</div>
						</div>
						<button type='submit' className='btn btn-primary w-full' disabled={isLoading}>
							{isLoading ? <Loader2 className='size-5 animate-spin' /> : "Reset Password"}
						</button>
					</form>
				)}

				<div className='text-center'>
					<p className='text-base-content/60'>
						Remembered your password?{" "}
						<Link to='/login' className='link link-primary'>
							Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;

