// Default root should render the public home (located in `(public)/page.tsx`)
import PublicLayout from './(public)/layout';
import Home from './(public)/page';

export default function RootPage() {
	return (
		<PublicLayout>
			<Home />
		</PublicLayout>
	);
}
