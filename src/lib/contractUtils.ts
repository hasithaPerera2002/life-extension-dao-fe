import { Interface } from "ethers";
import { toast } from "sonner";

/**
 * Handles staticCall or transaction errors with ABI-based decoding
 */
export async function handleContractCall({
  fn,
  abi,
  onSuccess,
}: {
  fn: () => Promise<any>;
  abi: any;
  onSuccess?: (result: any) => void;
}) {
  try {
    const result = await fn();
    if (onSuccess) onSuccess(result);
    return result;
  } catch (error: any) {
    console.error("Contract call error:", error);
    const iface = new Interface(abi);

    // Try parsing EVM revert reason from error data
    const revertData =
      error?.error?.data?.data || error?.data?.data || error?.data;

    if (typeof revertData === "string") {
      try {
        const decoded = iface.parseError(revertData);
        console.error("Decoded revert:", decoded);
        toast.error(decoded.args?.reason || decoded.name);
        return;
      } catch (_) {
        console.warn("Failed to decode revert data");
      }
    }

    if (error.code === "ACTION_REJECTED") {
      toast.error("Transaction cancelled");
    } else if (error.reason) {
      toast.error(error.reason);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("Unknown contract error");
    }
  }
}
