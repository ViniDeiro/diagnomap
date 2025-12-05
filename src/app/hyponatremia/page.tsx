"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import HyponatremiaFlowchart from "@/components/HyponatremiaFlowchart"
import PatientForm from "@/components/PatientForm"
import { patientService } from "@/services/patientService"
import { Patient, PatientFormData } from "@/types/patient"

export default function Page() {
  const router = useRouter()
  const [stage, setStage] = useState<"new" | "flowchart">("new")
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [formMode, setFormMode] = useState<"compact" | "selector">("compact")

  const handleSubmit = (data: PatientFormData) => {
    const patient = patientService.createPatient(data)
    setCurrentPatient(patient)
    setStage("flowchart")
  }

  const handleCancel = () => {
    // No seletor de fluxogramas, voltar ao dashboard
    if (formMode === "selector") {
      router.push("/")
    } else {
      // No modo compacto, voltar para o seletor
      setFormMode("selector")
    }
  }

  return (
    <main className="p-4">
      {stage === "new" ? (
        <PatientForm
          key={formMode}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onEmergencySelector={() => setFormMode("selector")}
          initialStep={formMode === "compact" ? 2 : 1}
          presetFlowchart={"dengue"}
          skipFlowSelection={formMode === "compact"}
          onlyPersonalData={formMode === "compact"}
        />
      ) : (
        <HyponatremiaFlowchart
          patient={currentPatient ?? undefined}
          onBack={() => {
            setStage("new")
            setFormMode("selector")
          }}
        />
      )}
    </main>
  )
}
