import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

const ProtectedRoute = () => {
    const context = useOutletContext();

    if (!context.auth?.accessToken) {
        alert('access Denied, please authenticate')
        return <Navigate to="/" replace />;
    }

    return <Outlet context={context} />;
};
export{
    ProtectedRoute
}