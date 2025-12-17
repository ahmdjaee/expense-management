import { X } from 'lucide-react';
import { useState } from 'react';
import InputError from './input-error';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginCodeInputProps {
    errors?: any;
    initialCodes?: string[];
}

const LoginCodeInput = ({ errors, initialCodes = [] }: LoginCodeInputProps) => {
    const [loginCodes, setLoginCodes] = useState<string[]>(initialCodes);
    const [inputValue, setInputValue] = useState('');

    const handleAddCode = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
            e.preventDefault();
            const trimmedValue = inputValue.trim();

            if (trimmedValue && !loginCodes.includes(trimmedValue)) {
                setLoginCodes([...loginCodes, trimmedValue]);
                setInputValue('');
            }
        }
    };

    const handleRemoveCode = (codeToRemove: string) => {
        setLoginCodes(loginCodes.filter((code) => code !== codeToRemove));
    };

    return (
        <div className="space-y-2">
            <Label htmlFor="login_code_input">
                Login MT5 Codes <span className="text-red-500">*</span>
            </Label>

            {/* Hidden input untuk mengirim data ke backend (Inertia Form akan handle ini) */}
            <input type="hidden" name="codes" value={JSON.stringify(loginCodes)} />

            {/* Input field untuk menambah code */}
            <div className="flex gap-2">
                <Input
                    id="login_code_input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddCode as any}
                    placeholder="Type code and press Enter"
                    className="border-muted bg-muted/50"
                />
                <Button
                    type="button"
                    onClick={handleAddCode as any}
                    variant="outline"
                    className="whitespace-nowrap"
                >
                    Add Code
                </Button>
            </div>

            {/* Display badges */}
            {loginCodes.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-muted bg-muted/20">
                    {loginCodes.map((code, index) => (
                        <div
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                        >
                            <span>{code}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveCode(code)}
                                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                aria-label={`Remove ${code}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <InputError message={errors?.codes || errors?.code} />

            <p className="text-xs text-muted-foreground">
                {loginCodes.length === 0
                    ? 'Add login codes by typing and pressing Enter or clicking "Add Code"'
                    : `${loginCodes.length} login code(s) added`}
            </p>
        </div>
    );
};

export default LoginCodeInput;