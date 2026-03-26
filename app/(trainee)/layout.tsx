import SeatNumberProvider from "@/app/components/seat-number-provider";
import HelpButton from "@/app/components/help-button";

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SeatNumberProvider>
      {children}
      <HelpButton />
    </SeatNumberProvider>
  );
}
