
import { DashboardContent } from "@/components/dashboard/DashboardContent"
import {
  getUserSubscription,
  getTotalRequest,
  getRecordPrompts,
  
} from "@/actions/activity/getRecordsUser"

export default function DashboardPage() {
/*
  let subscription = getUserSubscription()
         let total = getTotalRequest()
         let prompt = getRecordPrompts()
         
         
 
  */
  return <DashboardContent
  /*subscription={subscription}
  total={total} 
  prompt={prompt}*/
  />
}

