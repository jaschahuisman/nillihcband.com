import { redirect } from "next/navigation";
import { ContactsView } from "@/components/crm/contacts-view";
import { getSessionUser } from "@/lib/auth";
import { getContacts } from "@/lib/crm/queries";

export default async function ContactsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/crm/login");

  const contacts = await getContacts();
  return <ContactsView contacts={contacts} />;
}
