import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useCheckCandidateAuthQuery } from "../modules/candidate_slice";

interface CandidateState {
  email: string | null;
  authorized: boolean | null;
  loading: boolean;
  setAuth: (auth: { email: string | null; authorized: boolean | null }) => void;
}

const defaultCandidateState: CandidateState = {
  email: null,
  authorized: null,
  loading: true,
  setAuth: () => {},
};

const CandidateContext = createContext<CandidateState>(defaultCandidateState);

interface CandidateProviderProps {
  children: ReactNode;
}

export const CandidateProvider = ({children}: CandidateProviderProps) => {
  const responseId = localStorage.getItem("responseId");
  const skipQuery = !responseId;
  const { data } = useCheckCandidateAuthQuery(undefined, { skip: skipQuery });
  const [auth, setAuthState] = useState<Omit<CandidateState, "setAuth">>({
    email: null,
    authorized: null,
    loading: true,
  });

  const setAuth = useCallback(
    (authData: { email: string | null; authorized: boolean | null }) => {
      setAuthState({ ...authData, loading: false });
    },
    []
  );

  useEffect(() => {
    const loadAuth = () => {
      if (data?.authorized) {
        setAuthState({
          email: data.email ?? null,
          authorized: data.authorized ?? null,
          loading: false,
        });
      } else {
        setAuthState({ email: null, authorized: false, loading: false });
      }
    };

    loadAuth();
  }, [data]);

  return (
    <CandidateContext.Provider
      value={{
        ...auth,
        setAuth,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidate = (): CandidateState => useContext(CandidateContext);
