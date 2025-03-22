import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NetworkBadge } from "@/components/networks/network-badge";

const liaisons = [
  {
    name: "Agent 1 ",
    network: "base",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 2",
    network: "ethereum",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 3",
    network: "optimism",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 4",
    network: "og",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 5",
    network: "arbitrum",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 6",
    network: "arbitrum",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
  {
    name: "Agent 7",
    network: "ethereum",
    liaisonKey: "lk234...2345",
    createdAt: "23/12/2024",
    lastUsed: "23/2/2025",
  },
];

export function LiasonsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead className="font-semibold">Network</TableHead>
          <TableHead className="font-semibold">Liaison Key</TableHead>
          <TableHead className="font-semibold">Created</TableHead>
          <TableHead className="font-semibold">Last used</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {liaisons.map((liaison) => (
          <TableRow key={liaison.name}>
            <TableCell className="font-medium">{liaison.name}</TableCell>
            <TableCell>
              <NetworkBadge value={liaison.network} />
            </TableCell>
            <TableCell>{liaison.liaisonKey}</TableCell>
            <TableCell className="">{liaison.createdAt}</TableCell>
            <TableCell className="">{liaison.lastUsed}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
