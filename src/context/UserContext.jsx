import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [group, setGroup] = useState(null);
  return (
    <UserContext.Provider value={{ group, setGroup }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
