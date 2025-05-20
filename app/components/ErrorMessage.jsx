export const ErrorMessage = ({ error }) => {
    if (!error) return null;

    return (
        <div className="mt-1 text-red-400 text-sm font-arabicUI2">
            {error}
        </div>
    );
};
