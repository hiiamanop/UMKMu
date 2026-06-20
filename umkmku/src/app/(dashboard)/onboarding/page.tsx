import { OnboardingChat } from './_components/onboarding-chat'

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ceritakan bisnis kamu</h1>
        <p className="text-gray-500 mt-1">
          Ceritakan brand skincare kamu — nama, produk, warna favorit, siapa target customer kamu.
          Semakin detail semakin bagus. Kami akan buatkan toko kamu dalam hitungan detik.
        </p>
      </div>
      <OnboardingChat />
    </div>
  )
}
