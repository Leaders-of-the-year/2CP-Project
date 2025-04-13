"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Filter, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSocketIO } from "@/hooks/use-socket-io"

export default function WaitingPatientsPage() {
  const router = useRouter()
  const { waitingPatients, acceptPatient, refreshWaitingPatients, isConnected } = useSocketIO("doctor")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<string[]>([])

  // Refresh waiting patients list periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isConnected) {
        refreshWaitingPatients()
      }
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(intervalId)
  }, [isConnected, refreshWaitingPatients])

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(waitingPatients)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredPatients(waitingPatients.filter((patientId) => patientId.toLowerCase().includes(query)))
    }
  }, [waitingPatients, searchQuery])

  const handleAcceptPatient = (patientId: string) => {
    // Accept the patient first to establish the connection
    acceptPatient(patientId)
    // Then redirect to the video call page
    router.push("/videocall/doctor")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
      </header>

      <main className="flex-1 p-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>My Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <TabsList>
                  <TabsTrigger value="all" className="rounded-full">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="by-time" className="rounded-full">
                    By time
                  </TabsTrigger>
                  <TabsTrigger value="a-z" className="rounded-full">
                    A-Z
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search"
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <TabsContent value="all" className="m-0">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div className="col-span-4">Patient ID</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3">Waiting Time</div>
                    <div className="col-span-2"></div>
                  </div>

                  {filteredPatients.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No patients waiting at the moment</div>
                  ) : (
                    <div className="divide-y">
                      {filteredPatients.map((patientId, index) => (
                        <div key={patientId} className="grid grid-cols-12 gap-4 p-4 items-center">
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-teal-600" />
                            </div>
                            <div className="font-medium">{patientId.substring(0, 8)}</div>
                          </div>
                          <div className="col-span-3">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Waiting
                            </Badge>
                          </div>
                          <div className="col-span-3 flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{Math.floor(Math.random() * 10) + 1}m</span>
                          </div>
                          <div className="col-span-2 text-right">
                            <Button
                              onClick={() => handleAcceptPatient(patientId)}
                              className="bg-teal-600 hover:bg-teal-700 text-white"
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="by-time" className="m-0">
                <div className="p-8 text-center text-muted-foreground">Sorted by waiting time</div>
              </TabsContent>

              <TabsContent value="a-z" className="m-0">
                <div className="p-8 text-center text-muted-foreground">Sorted alphabetically</div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-sm text-muted-foreground">Total Patients: {filteredPatients.length}</div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
