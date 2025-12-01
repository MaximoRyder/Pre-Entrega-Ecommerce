export async function updateQuantityWithRetry(url, newQuantity, attempts = 3, currentProd = null) {
    let lastErr = null;
    for (let i = 0; i < attempts; i++) {
        try {
            let prod;
            if (currentProd && typeof currentProd === "object") {
                prod = { ...currentProd };
            } else {
                const getRes = await fetch(url);
                if (!getRes.ok) throw new Error(`GET ${getRes.status}`);
                prod = await getRes.json();
            }
            prod.quantity = newQuantity;
            const putRes = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prod),
            });
            if (!putRes.ok) {
                const text = await putRes.text().catch(() => null);
                throw new Error(`PUT ${putRes.status} ${text || ""}`);
            }
            return putRes;
        } catch (e) {
            lastErr = e;
            await new Promise((r) => setTimeout(r, 250 * Math.pow(2, i)));
        }
    }
    throw lastErr;
}

export async function runWithConcurrency(taskFns, limit = 4) {
    const results = [];
    let idx = 0;

    return new Promise((resolve) => {
        let active = 0;
        let finished = 0;
        const total = taskFns.length;

        function runNext() {
            if (finished === total) return resolve(results);
            while (active < limit && idx < total) {
                const cur = idx++;
                active++;
                Promise.resolve()
                    .then(() => taskFns[cur]())
                    .then((res) => {
                        results[cur] = { status: "fulfilled", value: res };
                    })
                    .catch((err) => {
                        results[cur] = { status: "rejected", reason: err };
                    })
                    .finally(() => {
                        active--;
                        finished++;
                        runNext();
                    });
            }
        }

        runNext();
    });
}
