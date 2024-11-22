import {createContext, useState} from "react";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const updateUserInfo = (info) => {
    setUserInfo(info);
    if (info) {
      localStorage.setItem('userInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('userInfo');
    }
  };

  return (
    <UserContext.Provider value={{userInfo, setUserInfo: updateUserInfo}}>
      {children}
    </UserContext.Provider>
  );
} 