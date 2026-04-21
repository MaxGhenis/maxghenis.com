export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-[72ch] px-6 lg:px-10 py-16">
      {children}
    </article>
  );
}
