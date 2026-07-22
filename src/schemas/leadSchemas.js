import { z } from 'zod'

const fullName = z.string().trim().min(2, 'Enter your full name')
const email = z.string().trim().email('Enter a valid email address')
const phoneNumber = z.string().trim().min(7, 'Enter a valid phone number')
const consentGiven = z.boolean().refine((v) => v === true, {
  message: 'Please confirm we can contact you about this',
})

export const contactSchema = z.object({
  full_name: fullName,
  email,
  phone_number: phoneNumber,
  message: z.string().trim().min(10, 'Tell us a bit more (at least 10 characters)'),
  consent_given: consentGiven,
})

export const startProjectSchema = z.object({
  full_name: fullName,
  email,
  phone_number: phoneNumber,
  project_type: z.string().min(1, 'Select a project type'),
  budget_range: z.string().min(1, 'Select a budget range'),
  timeline: z.string().min(1, 'Select a timeline'),
  message: z.string().trim().optional(),
  consent_given: consentGiven,
})

export const consultationSchema = z.object({
  full_name: fullName,
  email,
  phone_number: phoneNumber,
  preferred_date: z.string().min(1, 'Choose a preferred date'),
  preferred_time_slot: z.string().min(1, 'Choose a time slot'),
  message: z.string().trim().optional(),
  consent_given: consentGiven,
})

export const resourceDownloadSchema = z.object({
  full_name: fullName,
  email,
  resource_name: z.string().min(1, 'Select a resource'),
  consent_given: consentGiven,
})

export const newsletterSchema = z.object({
  email,
})

export const signupSchema = z.object({
  full_name: fullName,
  email,
  phone_number: z.string().trim().optional().or(z.literal('')),
  password: z.string().min(8, 'Must be at least 8 characters').max(72, 'Must be under 72 characters'),
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const otpSchema = z.object({
  otp_code: z.string().length(6, 'Enter the 6-digit code'),
})
