import { MobileProfile } from "@/components/mobile/profile/MobileProfile";

export default function ProfilePage() {
  return (
    <>
      <div className="md:hidden">
        <MobileProfile />
      </div>
      <div className="hidden md:block">{/* desktop profile — not built yet */}</div>
    </>
  );
}
