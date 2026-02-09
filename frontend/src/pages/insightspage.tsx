import { FastballVelocityChart } from "@/components/insights/fastball_velocity";
import PitchMixChart from "@/components/insights/pitch_mix";
import { VelocityByPitchTypeChart } from "@/components/insights/velocity_by_pitch_type";
import { useParams } from "react-router-dom";
import Footer from "../components/footer";

export default function InsightsPage() {
    const { fileID } = useParams<{ fileID: string }>(); 
    console.log("Param fileID:", fileID);

    
    if (!fileID) {
        return <p className="text-center text-blue-500"> No file ID provided. </p>
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-300 to-green-300 bg-clip-text text-transparent">
                Pulse Labs Pitching Insights
            </h1>

            <div className="max-w-4xl mx-auto mb-12">
                <FastballVelocityChart fileId={fileID} />
            </div>

            <div className="max-w-4xl mx-auto mb-12">
                <VelocityByPitchTypeChart fileId={fileID} />
            </div>

            <div className="max-w-4xl mx-auto mb-12">
                <PitchMixChart fileId={fileID} />
            </div>

            <div>   
                <Footer />
            </div>

        </div>
    );
}