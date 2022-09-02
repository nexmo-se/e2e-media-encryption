import { createContext, ReactNode, useState} from 'react';
import User from 'entities/user';

interface MeContextProviderProps {
    children: ReactNode
}


interface IMeContext {
    user: User | null;
    loginUser: (user: User) => void;
}

const meInfo:IMeContext = {
    user: null,
    loginUser: (user: User) => {},
}

// use for calling
export const MeContext = createContext<IMeContext>(meInfo)

// Use for wrapping
export const MeContextProvider = ({children}: MeContextProviderProps) => {  
    const [user, setUser] = useState<User | null>(null);

    function loginUser(user: User) {
      setUser(user);
    }

    return (
        <MeContext.Provider value={{
                user,
                loginUser
            }}>
            {children}
        </MeContext.Provider>
    )

}
