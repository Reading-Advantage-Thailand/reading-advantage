import { Box } from "@mui/material";
import { ReactNode } from "react";

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ height: "100vh", bgcolor: "#f5f3f3" }}>
      <Box p={2}>{children}</Box>
    </Box>
  );
};
export default DefaultLayout;
