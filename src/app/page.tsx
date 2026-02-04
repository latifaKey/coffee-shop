// Default root should render the public home (located in `(site)/page.tsx`)
import PublicLayout from './(site)/layout';
import Home from './(site)/page';

export default function RootPage() {
	return (
		<PublicLayout>
			<Home />
		</PublicLayout>
	);
}

