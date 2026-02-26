import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { createPageUrl } from '@/utils';

export default function PageNotFound({}) {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(createPageUrl('Home'), { replace: true });
    }, []);
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div />
        </div>
    )
}