import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DeepLinkHandler() {
    const navigate = useNavigate();

    useEffect(() => {
        // Ambil parameter "post" dari URL
        const params = new URLSearchParams(window.location.search);
        const postSlug = params.get("post");

        // Kalau ada parameter post → redirect ke /blog/:slug
        if (postSlug) {
            navigate(`/blog/${postSlug}`, { replace: true });
        }
    }, [navigate]);

    return null; // Tidak merender apapun
}
