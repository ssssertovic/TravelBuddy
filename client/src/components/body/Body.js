import { Outlet } from "react-router-dom";

function Body() {
  return (
    <main className="flex-1 w-full">
      <Outlet />
    </main>
  );
}

export default Body;
