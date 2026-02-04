// Default root should render the public home (located in `main/page.tsx`)
import PublicLayout from './main/layout';
import Home from './main/page';

export default function RootPage() {
	return (
		<PublicLayout>
			<Home />
		</PublicLayout>
	);
}

