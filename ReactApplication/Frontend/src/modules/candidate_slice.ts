import {
  BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Field, Form } from "./admin_slice";
 
export interface LoginCandidateInput {
  email: string;
  password: string;
  formId: string;
}
interface Submission {
  responseId: string;
  formId?: string;
  value?: any;
  userEmail?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  remarks?: string;
  score?: string;
  status?: string;
  termsAccepted?: string;
}
export interface EditSubmissionInput {
  formId: string;
  responseId?: string;
  value?: any;
  userEmail: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  termsAccepted?: string;
  remarks?: string;
  score?: number;
  status?: string;
}
export interface CandidateSubmission {
  id: number;
  responseId: string;
  formId: string;
  value: any;
  userEmail: string;
  startTime: string;
  endTime: string;
  duration: string;
  score: string;
  status: string;
  remarks: string;
  termsAccepted: string;
  warnings: number;
}
export interface EditSubmissionResponse {
  message: string;
}
export interface LoginCandidateResponse {
  message: string;
  email: string;
  candidateToken: string;
}
 
interface AddSubmissionResponse {
  message: string;
  responseId: string;
}
 
export interface CandidateAuthResponse {
  authorized: boolean;
  email: string;
}
 
const baseURL = import.meta.env.VITE_USE_TUNNEL === "true"
  ? import.meta.env.VITE_CANDIDATE
  : import.meta.env.VITE_CANDIDATE_LOCAL;
 
const baseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: "include",
});
 
const baseQueryWithReauth: BaseQueryFn<any, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);
 
  if (result.error && result.error.status === 401) {
    console.warn(" Time Over. Redirecting to /candidate-login ");
    return result;
  }
 
  return result;
};
 
export const candidateSlice = createApi({
  reducerPath: "candidate_api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Forms", "Fields", "Submissions"],
  endpoints: (builder) => ({
    loginCandidate: builder.mutation<
      LoginCandidateResponse,
      LoginCandidateInput
    >({
      query: ({ email, password, formId }) => ({
        url: "/login",
        method: "POST",
        body: { email, password, formId },
      }),
    }),
 
    checkCandidateAuth: builder.query<CandidateAuthResponse, void>({
      query: () => ({
        url: "/check-auth",
        method: "GET",
      }),
    }),
 
    logoutCandidate: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
 
    addSubmission: builder.mutation<
      AddSubmissionResponse,
      { formId: string; data: Submission }
    >({
      query: ({ formId, data }) => ({
        url: `form/${formId}/submit`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Submissions", id: formId },
      ],
    }),
 
    editSubmission: builder.mutation<
      EditSubmissionResponse,
      EditSubmissionInput
    >({
      query: ({ formId, ...body }) => ({
        url: `form/${formId}/submission`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Submissions", id: formId },
      ],
    }),
 
    getCandidateSubmission: builder.query<
      CandidateSubmission,
      { responseId: string; formId: string }
    >({
      query: ({ responseId, formId }) => `/submission/${responseId}/${formId}`,
    }),
 
    updateTimer: builder.mutation<
      { message: string },
      { formId: string; userEmail: string; Timer: string }
    >({
      query: ({ formId, userEmail, Timer }) => ({
        url: `/form/${formId}/candidate/${userEmail}/timer`,
        method: "PUT",
        body: { Timer },
      }),
    }),
 
    updateWarnings: builder.mutation<
      EditSubmissionResponse,
      { formId: string; userEmail: string; warnings: number }
    >({
      query: ({ formId, userEmail, warnings }) => ({
        url: `/form/${formId}/candidate/${userEmail}/warnings`,
        method: "PUT",
        body: { warnings },
      }),
      invalidatesTags: (_result, _error, { formId }) => [
        { type: "Submissions", id: formId },
      ],
    }),
 
    getFieldsByCandidateFormId: builder.query<Field[], string>({
      query: (formId) => `form/${formId}/field`,
      providesTags: (_result, _error, formId) => [
        { type: "Fields", id: formId },
      ],
    }),
 
    getFormById: builder.query<Form, string>({
      query: (formId) => `form/${formId}`,
      providesTags: (_result, _error, formId) => [
        { type: "Forms", id: formId },
      ],
    }),
 
    getStartTime: builder.query({
      query: ({ formId, responseId }) => `/start-time/${formId}/${responseId}`,
    }),
  }),
});
 
export const {
  useLoginCandidateMutation,
  useCheckCandidateAuthQuery,
  useGetFormByIdQuery,
  useLazyGetFormByIdQuery,
  useLogoutCandidateMutation,
  useGetFieldsByCandidateFormIdQuery,
  useUpdateWarningsMutation,
  useUpdateTimerMutation,
  useAddSubmissionMutation,
  useEditSubmissionMutation,
  useGetCandidateSubmissionQuery,
  useGetStartTimeQuery,
} = candidateSlice;