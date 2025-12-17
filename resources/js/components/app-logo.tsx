import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className='flex items-center'>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon />
            </div>
            <div className="ml-1 hidden flex-1 text-left text-sm md:block">
                <span className="mb-0.5 truncate leading-tight font-semibold">GIB Super App</span>
            </div>
        </div>
    );
}
